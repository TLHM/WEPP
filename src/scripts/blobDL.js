/*jshint esversion: 6 */

/* Just a function to download a blob */

export default function downloadBlob(blob, suggestedName='') {
      // from https://stackoverflow.com/questions/8310657/how-to-create-a-dynamic-file-link-for-download-in-javascript
      var dlink = document.createElement('a');
      dlink.style.display = 'none';
      if(suggestedName.length>0) dlink.download = suggestedName;
      //dlink.target='_blank';
      dlink.href = window.URL.createObjectURL(blob);
      dlink.onclick = function(e) {
          // revokeObjectURL needs a delay to work properly
          var that = this;
          setTimeout(function() {
              window.URL.revokeObjectURL(that.href);
          }, 1500);
      };
      document.body.appendChild(dlink);
      dlink.click();
      dlink.remove();
  }
