import * as functions from "firebase-functions";
import {trackRecordingView} from "./track-recording-view";

import * as admin from "firebase-admin";
// eslint-disable-next-line max-len
import * as serviceAccount from "../sirocodingchallenges-firebase-adminsdk-d5epk-d5345de48d.json";
import {ServiceAccount} from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  projectId: "sirocodingchallenges",
});

// use db to access the database
export const db = admin.firestore();


// If you need, here's the documentation for google cloud functions w typescript:
// https://firebase.google.com/docs/functions/typescript

// assumes the request has been authenticated, the caller has the required permissions
export const recordingViews = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "POST");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "POST") {
    try {
      const {viewerId, recordingId} = request.body;      

      const recording = await db.collection("Recordings").doc(recordingId).get();
      const user = await db.collection("Users").doc(viewerId).get();

      var creator=recording.get("creatorId");

      if(user.id==creator){
        response.status(400).send();
      }
      else{
      await trackRecordingView(viewerId, recordingId);
      // it worked!
      response.status(200).send("No errors!");
      }
      
    } catch (e) {
      // it didn't work :/
      functions.logger.error(e);
      response.status(500).send("We messed up :(");
    }
  } else if (request.method === "OPTIONS") {
    response.status(204).send("Go ahead");
  } else {
    functions.logger.debug("request wasn't a POST or OPTIONS");
    response.status(400).send("only OPTIONS or POST requests are allowed");
  }
});
