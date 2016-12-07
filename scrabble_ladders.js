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
var lookup={};
var wordscores= {};

// Creating the Word Scores dictionary.
input.forEach(function(elt){
  eltlet= elt.split('');
  wordscores[elt]= eltlet.map(function(let){
    return dict[let]}).reduce(function(a,b){return a+b},0);
})

// Creating edges: the dictionary 'lookup' maps an element to all of its
// successors.
input.forEach(function(elt){
    lookup[elt]= [];
    var allthesmallers= input.filter(function(melt){
      return wordscores[elt]>wordscores[melt];
    })
    lookup[elt]= allthesmallers.filter(function(melt){
      return isedge(elt,melt)
    })
})

/* Now we have the DAG.
A word ladder is a pair of sequences emanating from the same node, with the
same length and no nodes in common. (Except the starting node.)
We search for these by looping through each starting node in turn,
collecting all of the sequences starting at the node, then analysing them
in pairs to see whether they form valid word ladders.
*/
var bestscore = 0
for (middleword in wordscores){
  var score_for_middleword = wordscores[middleword]
  var all_sequences = find_sequences(middleword);
  if (all_sequences.length > 1){
    var split_sequences = split_sequences_by_length(all_sequences)
    score_for_middleword = wordscores[middleword] + compare_sequences(split_sequences)
  }
  bestscore = Math.max(bestscore, score_for_middleword)
}

console.log(bestscore)
  //process.stdout.write(

function isedge(a,b){
  a= a.split('');
  b= b.split('');
  var ctr=0;
  a.forEach(function(elt,ind){
    if (a[ind]!=b[ind]){ctr++}
  })
  return ctr==1;
}



//object wth keys which are dictionary words; values are arrays of successors
function find_sequences(maxword){
  var queue = [[]]
  var all_sequences = []

  while(queue.length > 0){
    var currentseq = queue.pop()
    if(currentseq.length == 0){
      lookup[maxword].forEach(function(child){
        queue.push([child])
        all_sequences.push([child])
      })
    } else {
      lookup[currentseq[currentseq.length-1]].forEach(function(child){
        queue.push(currentseq.concat([child]))
        all_sequences.push(currentseq.concat([child]))
      })
    }
  }
  return all_sequences
}

function array_score(a){
  return a.reduce(function(score, v){return score + wordscores[v]}, 0)
}

function find_best_ladder(sequences_of_one_length){
  bestscore = 0
  pairs = []
  for(var i=0; i<sequences_of_one_length.length; i++){
    for(var j=i+1; j<sequences_of_one_length.length; j++){
      intersection = sequences_of_one_length[i].filter(function(n) {
                        return sequences_of_one_length[j].indexOf(n) != -1;
                        });
      if (intersection.length==0){
        bestscore = Math.max(bestscore, array_score(sequences_of_one_length[i]) + array_score(sequences_of_one_length[j]))
      }
    }
  }
  return bestscore
}

function compare_sequences(sequences_by_length){
  bestscore = 0
  sequences_by_length.forEach(function(length_array){
    pairs = []
    for(var i=0; i<length_array.length; i++){
      for(var j=i+1; j<length_array.length; j++){
        intersection = length_array[i].filter(function(n) {
                          return length_array[j].indexOf(n) != -1;
                          });
        if (intersection.length==0){
          bestscore = Math.max(bestscore, array_score(length_array[i]) + array_score(length_array[j]))
        }
      }
    }
  })
  return bestscore
}

function split_sequences_by_length(list_of_sequences){
  list_of_sequences = list_of_sequences.sort(function (a, b) { return b.length - a.length });
  var maxlength = list_of_sequences[0].length
  var outputs = []
  for(var i = 0; i<maxlength; i++){outputs.push([])}
  list_of_sequences.forEach(function(seq){outputs[seq.length-1].push(seq)})
  return outputs
}

}
testinput = `2
20
A
AD
APPLE
AX
AY
BAG
BAT
BO
CONCERTO
CORNUCOPIA
EX
LEWIS
MOATS
PI
RA
QUESTION
QUORA
WONDERLAND
ZA
ZOOLOGY`

processData(testinput)
