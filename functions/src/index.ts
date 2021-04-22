import * as firebaseAdmin from 'firebase-admin';
import validate, { manualTrigger } from './validate';

firebaseAdmin.initializeApp();

exports.validate = validate(firebaseAdmin);

if (process.env.FUNCTIONS_EMULATOR) {
  exports.manualTrigger = manualTrigger;
}
