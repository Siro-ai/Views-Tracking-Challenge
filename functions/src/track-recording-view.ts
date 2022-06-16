import * as functions from "firebase-functions";
import {db} from "./index";


function updateCheckViewed(hashJoe:any,hashJake:any,userid:string,recordingid:string):boolean{

  functions.logger.debug("hashJoe ",hashJoe.get(recordingid));
  functions.logger.debug("userid: ",userid);

  if(hashJoe[recordingid]&&userid=="Joe"){
    return true;
  }
  else if(hashJake[recordingid]&&userid=="Jake"){

    return true;
  }
  else{
  
      if(userid=="Joe"){
        hashJoe[recordingid]=userid;
        functions.logger.debug("setting ",hashJoe[recordingid]);
       
      }
      else{
        hashJake[recordingid]=userid;
        functions.logger.debug("setting ",hashJake[recordingid]);

      }
       return false;
  }

}

export async function trackRecordingView(viewerId: string, recordingId: string): Promise<void> {
  // TODO: implement this function

  if (typeof hashJoe === 'undefined') {
    var hashJoe:any = new Map<string,string>();
  }
  if (typeof hashJake === 'undefined') {
    var hashJake:any = new Map<string,string>();
  }

  // logs can be viewed in the firebase emulator ui
  functions.logger.debug("viewerId: ", viewerId);
  functions.logger.debug("recordingId: ", recordingId);

  if(false==updateCheckViewed(hashJoe,hashJake,viewerId,recordingId)){

  const recording = await db.collection("Recordings").doc(recordingId).get();
  const user = await db.collection("Users").doc(viewerId).get();
  var amount = recording.get("uniqueViewCount");
  var userAmount =user.get("uniqueRecordingViewCount");
  await db.collection("Recordings").doc(recordingId).update({uniqueViewCount: amount+1});
  await db.collection("Users").doc(viewerId).update({uniqueRecordingViewCount: userAmount+1});
  }

  // read from a document
  const documentSnapshot = await db.collection("collection").doc("doc").get();
  if (documentSnapshot.exists) {
    const data = documentSnapshot.data();
    functions.logger.debug("it did exist!", data);
  } else {
    functions.logger.debug("it didn't exist");
  }

  // overwrite a document based on the data you have when sending the write request
  // set overwrites all existing fields and creates new documents if necessary
  await db.collection("collection").doc("doc").set({id: viewerId, field: recordingId});
  // update will fail if the document exists and will only update fields included
  // in your update
  await db.collection("collection").doc("doc").update({id: viewerId, field: recordingId});

  // update based on data inside the document at the time of the write using a transaction
  // https://firebase.google.com/docs/firestore/manage-data/transactions#web-version-9

  await db.runTransaction(async (t): Promise<void> => {
    const ref = db.collection("collection").doc("doc");
    //const docSnapshot = await t.get(ref);
    // do something with the data

    //console.log(docSnapshot);
    t.set(ref, {id: viewerId, field: recordingId});

  });
}
