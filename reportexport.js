function exportPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

doc.text("Hospital Report",20,20);

doc.save("report.pdf");

}
