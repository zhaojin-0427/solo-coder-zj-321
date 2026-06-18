export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以进行打印');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>出门核对卡</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
            background-color: #FFFBEB;
            padding: 20px;
          }
          ${element.outerHTML}
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
