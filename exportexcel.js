function exportExcel(){

let table=document.getElementById("patientsTable");

let wb=XLSX.utils.table_to_book(table);

XLSX.writeFile(wb,"patients.xlsx");

}
