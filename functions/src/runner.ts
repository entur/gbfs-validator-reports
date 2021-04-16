import axios from "axios";

import gbfs from "./validation/gbfs";
import gbfsVersions from "./validation/gbfsVersions";
import vehicleTypes from "./validation/vehicleTypes";
import systemInformation from "./validation/systemInformation";
import stationInformation from "./validation/stationInformation";
import stationStatus from "./validation/stationStatus";
import freeBikeStatus from "./validation/freeBikeStatus";
import systemHours from "./validation/systemHours";
import systemCalendar from "./validation/systemCalendar";
import systemRegions from "./validation/systemRegions";
import systemPricingPlans from "./validation/systemPricingPlans";
import systemAlerts from "./validation/systemAlerts";
import geofencingZones from "./validation/geofencingZones";
import { ErrorObject } from "ajv";

enum File {
  gbfs = "gbfs",
  gbfs_versions = "gbfs_versions",
  vehicle_types = "vehicle_types",
  system_information = "system_information",
  station_information = "station_information",
  station_status = "station_status",
  free_bike_status = "free_bike_status",
  system_hours = "system_hours",
  system_calendar = "system_calendar",
  system_regions = "system_regions",
  system_pricing_plans = "system_pricing_plans",
  system_alerts = "system_alerts",
  geofencing_zones = "geofencing_zones",
}

type ValidatorResult = boolean | ErrorObject<string, Record<string, any>>[];

type Validator = (object: any) => ValidatorResult;

const validators: Record<File, Validator> = {
  [File.gbfs]: gbfs,
  [File.gbfs_versions]: gbfsVersions,
  [File.vehicle_types]: vehicleTypes,
  [File.system_information]: systemInformation,
  [File.station_information]: stationInformation,
  [File.station_status]: stationStatus,
  [File.free_bike_status]: freeBikeStatus,
  [File.system_hours]: systemHours,
  [File.system_calendar]: systemCalendar,
  [File.system_regions]: systemRegions,
  [File.system_pricing_plans]: systemPricingPlans,
  [File.system_alerts]: systemAlerts,
  [File.geofencing_zones]: geofencingZones,
}

function hasErrors(data: any, required?: boolean): boolean {
  let hasError = false

  data.forEach((el: any) => {
    if (Array.isArray(el)) {
      if (hasErrors(el, required)) {
        hasError = true
      }
    } else {
      if (required && !el.exists ? true : !!el.errors) {
        hasError = true
      }
    }
  })

  return hasError
}

export type RunnerOptions = {
  docked: boolean;
  freefloating: boolean;
}

export interface IRunner {
  new(url: string, options: RunnerOptions): void;
}

export type FileResult = {
  recommended: boolean;
  required: boolean;
  exists: boolean;
  errors: ValidatorResult;
  file: string;
  url: string | null;
}

export type RunnerResult = {
  summary: {
    hasErrors: boolean;
  },
  files: FileResult[]
};

class Runner {
  url: string;
  options: RunnerOptions;

  constructor(url: string, { docked = false, freefloating = false } = {}) {
    this.url = url
    this.options = {
      docked,
      freefloating
    }
  }

  alternativeAutoDiscovery(url: string) {
    return axios(url)
      .then(({ data }) => {
        if (typeof data !== "object") {
          return {
            recommended: true,
            required: true,
            errors: false,
            exists: false,
            file: "gbfs.json",
            url: null
          }
        }

        const errors = validators[File.gbfs](data);

        return {
          errors,
          url,
          recommended: true,
          required: true,
          exists: true,
          file: "gbfs.json",
        }
      })
      .catch(() => {
        return {
          url,
          recommended: true,
          required: true,
          errors: false,
          exists: false,
          file: "gbfs.json",
        }
      })
  }

  checkAutodiscovery() {
    return axios(this.url)
      .then(({ status, data }) => {
        if (typeof data !== "object") {
          return this.alternativeAutoDiscovery(`${this.url}/gbfs.json`)
        }

        const errors = validators[File.gbfs](data)
        return {
          errors,
          url: this.url,
          recommended: true,
          required: true,
          exists: true,
          file: "gbfs.json",
        }
      })
      .catch(() => {
        if (!this.url.match(/gbfs.json$/)) {
          return this.alternativeAutoDiscovery(`${this.url}/gbfs.json`);
        }

        return {
          url: this.url,
          recommended: true,
          required: true,
          errors: false,
          exists: false,
          file: "gbfs.json",
        }
      })
  }

  checkFile(type: File, required: boolean, recommended: boolean): Promise<FileResult> {
    return axios(`${this.url}/${File[type]}.json`)
      .then(({ data }) => ({
        required,
        recommended,
        errors: validators[type](data),
        exists: true,
        file: `${File[type]}.json`,
        url: `${this.url}/${File[type]}.json`
      }))
      .catch(err => ({
        required,
        recommended,
        errors: required ? err : null,
        exists: false,
        file: `${File[type]}.json`,
        url: `${this.url}/${File[type]}.json`
      }));
  }

  async validation(): Promise<RunnerResult> {
    const gbfsResult = await this.checkAutodiscovery()
    return Promise.all([
      Promise.resolve(gbfsResult),
      this.checkFile(File.gbfs_versions, false, false),
      this.checkFile(File.system_information, true, true),
      this.checkFile(File.vehicle_types, false, true),
      this.checkFile(File.station_information, this.options.docked, this.options.docked),
      this.checkFile(File.station_status, this.options.docked, this.options.docked),
      this.checkFile(File.free_bike_status, this.options.freefloating, this.options.freefloating),
      this.checkFile(File.system_hours, false, false),
      this.checkFile(File.system_calendar, false, false),
      this.checkFile(File.system_regions, false, false),
      this.checkFile(File.system_pricing_plans, true, true),
      this.checkFile(File.system_alerts, false, false),
      this.checkFile(File.geofencing_zones, false, false)
    ]).then(result => {
      return {
        summary: {
          hasErrors: hasErrors(result)
        },
        files: result
      }
    });
  }
}

export default Runner;