function processData(input) {

dict= {'A':1, 'E':1, 'I':1, 'L':1, 'N':1, 'O':1, 'R':1, 'S':1, 'T':1, 'U':1,
       'K':5, 'J':8, 'X':8, 'Q':10, 'Z':10, 'D':2, 'G':2, 'B':3, 'C':3, 'M':3,
       'P':3, 'F':4, 'H':4,'V':4, 'W':4,'Y':4}

input= input.split('\n');
minlength= Number(input.shift());
numwords= Number(input.shift());

//Filter out all of the elements which aren't the right length
input= input.filter(function(elt){
  return elt.length==minlength
})

/* We build a DAG representing the data. Nodes are the words; there is an
edge from a -> b iff score(a) > score(b) && b is one letter away from a.*/
var lookup = {};
var wordscores = {};

// Create the Word Scores dictionary.
input.forEach(function(elt){
  eltlet= elt.split('');
  wordscores[elt]= eltlet.map(function(let){
    return dict[let]}).reduce(function(a,b){return a+b},0);
})

// Create edges: the dictionary 'lookup' is an edge dictionary mapping
// an element to all of its successors (as defined above).
input.forEach(function(elt){
    lookup[elt]= [];
    var allthesmallers= input.filter(function(melt){
      return wordscores[elt]>wordscores[melt];
    })
    lookup[elt]= allthesmallers.filter(function(melt){
      return isedge(elt,melt)
    })
})

function isedge(a,b){
  a= a.split('');
  b= b.split('');
  var ctr=0;
  a.forEach(function(elt,ind){
    if (a[ind]!=b[ind]){ctr++}
  })
  return ctr==1;
}

/* Now we have the DAG.
A word ladder is a pair of sequences emanating from the same node, with the
same length and no nodes in common (except the starting node.)
We search for these by looping through each starting node in turn,
collecting all of the sequences starting at the node, then analysing them
in pairs to see whether they form valid word ladders.
*/
var overall_bestscore = 0
// Loop over the "emanating" nodes.
for (middleword in wordscores){
  var newbestscore = find_sequences(middleword);
  overall_bestscore = Math.max(overall_bestscore, newbestscore)
}

process.stdout.write(overall_bestscore)


//---------------Functions for implementing the search-------------------//
function find_sequences(middleword){
  var queue = []
  var all_sequences = []
  var currentlength = 0
  var bestscore = wordscores[middleword]
  var seqs_to_check = []

  lookup[middleword].forEach(function(child){
    queue.push([child]);
    seqs_to_check.push([child]);
  })
  bestscore = Math.max(best_ladder_score(seqs_to_check) + wordscores[middleword], bestscore)

  // Search the DAG 'breadth-first' to generate chains.
  // Because we go breadth-first, the chains are generated in length order and
  // so each set of chains held in seqs_to_check will be the same length.
  while(queue.length > 0){

    var seqs_to_check = []
    var newqueue = []
    for (var i=0; i<queue.length; i++){
      currentseq = queue[i]
      for (var j=0; j< lookup[currentseq[currentseq.length-1]].length; j++){
        child = lookup[currentseq[currentseq.length-1]][j];
        newqueue.push(currentseq.concat([child]));
        seqs_to_check.push(currentseq.concat([child]));
        }
    }
    queue = newqueue
    bestscore = Math.max(best_ladder_score(seqs_to_check) + wordscores[maxword], bestscore)
  }
  return bestscore
}

function array_score(a){
  // Score how many total points are in a sequence.
  return a.reduce(function(score, v){return score + wordscores[v]}, 0)
}

function best_ladder_score(sequences_of_one_length){
  // Compare sequences to each other to find the highest scoring pair of
  // non-overlapping sequences.
  bestscore = 0
  pairs = []
  for(var i=0; i<sequences_of_one_length.length; i++){
    for(var j=i+1; j<sequences_of_one_length.length; j++){

      intersection = sequences_of_one_length[i].filter(function(n) {
                        return sequences_of_one_length[j].indexOf(n) != -1;
                        });
      if (intersection.length == 0){
        bestscore = Math.max(bestscore, array_score(sequences_of_one_length[i]) + array_score(sequences_of_one_length[j]))
      }
    }
  }
  return bestscore
}

}
