import { db } from "./firebase.js";

import { collection, addDoc, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addPatient = async function(){

const name = document.getElementById("name").value;
const age = document.getElementById("age").value;
const condition = document.getElementById("condition").value;

await addDoc(collection(db,"patients"),{
name,
age,
condition,
date:new Date()
});

alert("Patient saved");

loadPatients();

}

async function loadPatients(){

const querySnapshot = await getDocs(collection(db,"patients"));

let table="";

querySnapshot.forEach((doc)=>{
const p=doc.data();

table += `<tr>
<td>${p.name}</td>
<td>${p.age}</td>
<td>${p.condition}</td>
</tr>`;

});

document.getElementById("patientsTable").innerHTML=table;

}

loadPatients();
