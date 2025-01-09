const fileInputContainer = document.getElementById("fileInputContainer");
      const fileInput = document.getElementById("fileInput");
      const fileNamesElement = document.getElementById("fileNames");

      // Handling file input changes .. selecting and dragging
      fileInput.addEventListener("change", handleFileSelection);

      // Handling dragover event
      fileInputContainer.addEventListener("dragover", function (event) {
        event.preventDefault();
        fileInputContainer.classList.add("dragging"); // Add class when dragging
      });

      // Handling dragleave event
      fileInputContainer.addEventListener("dragleave", function () {
        fileInputContainer.classList.remove("dragging");
      });

      // Handlong drop event
      fileInputContainer.addEventListener("drop", function (event) {
        event.preventDefault();
        fileInputContainer.classList.remove("dragging");
        const files = event.dataTransfer.files;
        fileInput.files = files;
        handleFileSelection();
      });

      // Handling file selection and display the file names 
      function handleFileSelection() {
        const files = fileInput.files;

        if (files.length > 0) {
          const truncatedNames = Array.from(files)
            .map((file) => {
              let name = file.name;
              return name.length > 15 ? name.substring(0, 15) + "..." : name;
            })
            .join(", ");
          fileNamesElement.textContent = `Selected Files: ${truncatedNames}`;
        } else {
          fileNamesElement.textContent =
            "Click to select or drag and drop PDFs here";
        }
      }

      document.getElementById("combineButton").onclick = async function () {
        const files = document.getElementById("fileInput").files;
        if (files.length < 2) {
          alert("Please select at least two PDFs to combine.");
          return;
        }

        showPopup();

        // Creating a new PDF document
        const pdfDoc = await PDFLib.PDFDocument.create();

        // Looping through each selected file and add it to the PDF document
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const arrayBuffer = await file.arrayBuffer();
          const existingPdf = await PDFLib.PDFDocument.load(arrayBuffer);

          // Copying pages from the existing PDF
          const copiedPages = await pdfDoc.copyPages(
            existingPdf,
            existingPdf.getPageIndices()
          );
          copiedPages.forEach((page) => pdfDoc.addPage(page));
        }

        // Showing a 3s delay 
        await new Promise((resolve) => setTimeout(resolve, 3000)); 

        // Serializing the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // a downloadable link for the combined pdf
        const downloadLink = document.getElementById("downloadLink");
        const downloadBtn = document.getElementById("downloadBtn");
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        downloadBtn.href = url;
        downloadLink.style.display = "block";

        hidePopup();
      };

      function showPopup() {
        const progressPopup = document.getElementById("progressPopup");
        progressPopup.style.display = "flex";
      }

      function hidePopup() {
        const progressPopup = document.getElementById("progressPopup");
        progressPopup.style.display = "none";
      }