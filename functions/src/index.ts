import * as firebaseAdmin from "firebase-admin";
import validate from "./validate";

firebaseAdmin.initializeApp();

exports.validate = validate(firebaseAdmin);
