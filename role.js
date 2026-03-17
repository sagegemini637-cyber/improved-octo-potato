import { db } from "./firebase.js";
import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getUserRole(uid){

const userDoc = await getDoc(doc(db,"users",uid));

return userDoc.data().role;

}
