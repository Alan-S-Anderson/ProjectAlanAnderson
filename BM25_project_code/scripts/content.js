//Primary script to implement BM25 search on Wikipedia pages

const body = document.querySelector("body");
const wordMatchRegExp = /\w+/g; // Regular expression
const bm25K = 1.2;
const bm25B = 0.75;
	
//collect user search terms
let input = prompt("Please enter search terms", "Search terms");
let search = ""
if (input == null || input == "") {
  input = "User cancelled the prompt.";
}
else {
  search = input.match(wordMatchRegExp);
}

// search the body of the page
if ("body") {
  const text = body.innerHTML;
  const paras = body.getElementsByTagName("p");
  const num_paras = paras.length;
	
  // create an array of an index, the text content, length of text content in words, space for BM25 score.
  if (num_paras > 0) {
  	const textArray = [];
	let totalWords = 0;
    for (let i = 0; i < num_paras; i++) {
	  textArray[i] = [i, paras[i].innerText, 0, 0];
      let words1 = textArray[i][1].matchAll(wordMatchRegExp);
	  textArray[i][2] = [...words1].length;
	  totalWords = totalWords + textArray[i][2];
	}
	const avdl = totalWords/num_paras;
  
    //Calculate BM25 score.
	
	//Start by creating an array of word count by search term and para to get c(w,d)
	//Also create an array by search term of number of paras it appears in to get df(w)
	const wordCount = new Array(search.length); 
    for (var i = 0; i < search.length; i++) {
      wordCount[i] = new Array(num_paras); 
    }
	const docFreq = [];
		
    for (let j = 0; j < search.length; j++) {
	  let freq = 0;
	  for (let k = 0; k < num_paras; k++) {
		  let paraText = textArray[k][1].toLowerCase();
		  let searchTerm = search[j];
		  let count = paraText.split(searchTerm).length - 1;
		  wordCount[j][k] = count;
		  if (count > 0) {
		    freq = freq + 1;
		  }
      }
	  docFreq[j] = freq;
    }
	
    //Now run the BM25 formula for each para on each term and sum the term results
    for (let k = 0; k < num_paras; k++) {
	  let BM25 = 0;
	  for (let j = 0; j < search.length; j++) {
		let BM25_component = 0;
		if (docFreq[j] > 0 && textArray[k][2] > 0) {
	      BM25_component = (bm25K + 1) * wordCount[j][k] / (wordCount[j][k] + (bm25K*(1 - bm25B + bm25B * textArray[k][2] / avdl))) * Math.log((num_paras + 1) / docFreq[j]);
		}
		else {
		  BM25_component = 0;
		}
		BM25 = BM25 + BM25_component;
	  }
	  textArray[k][3] = BM25;
	}
  
    //sort array by BM25 score
	textArray.sort(compareBM25);

    function compareBM25(a, b) {
      if (a[3] === b[3]) {
        return 0;
      }
      else {
      return (a[3] > b[3]) ? -1 : 1;
      }
    }
      
	
	//using index, bold the text content of top 5 paras and duplicate them at the top with links to where they appear in the body
	
    for (let k = 0; k < 5; k++) {
		
      var elementA = paras[textArray[k][0]+k];
      elementA.style.fontWeight = "bold";

      var bookmark = document.createElement("div");
      bookmark.id = "BM25bookmark" + (k+1).toString();
      elementA.parentNode.insertBefore(bookmark, elementA);
	
      var paraHead = document.createElement("p");
      var headText = document.createTextNode("BM25 rank " + (k+1).toString() + "    BM25 score " + textArray[k][3].toString());
      paraHead.appendChild(headText);
	  var para = document.createElement("a");
      var node = document.createTextNode(textArray[k][1]);
      para.appendChild(node);
      para.href="#BM25bookmark" + (k+1).toString();
      var element = document.getElementById("siteSub");
      element.appendChild(paraHead);
      element.appendChild(para);
	}
	
  }

}