export async function callServer() {
  const response = await fetch('http://localhost:5000/zokrates/', {
    method: "POST",
    headers:{'content-type': 'application/json'},
    // body: JSON.stringify({input: data}),
  });
  // console.log(JSON.stringify({input: data}));
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};

export function parseServerResponse(buf) {
  var bufferArray = Buffer.from(buf);
  var bufferString = bufferArray.toString('utf8');
  console.log(typeof bufferString)
  console.log(bufferString)
	let split = bufferString.split(',')
  console.log("split: " + split[0])

	// var A = cleanResponseOnePair(split[0]);
	// var A_p = cleanResponseOnePair(split[1]);
  //
	// return {
	// 	A: A,
	// 	A_p: A_p,
	// };

  return 2
}

function cleanResponseOnePair(input) {
	var output;

	output = input.split('(');
	output = output[1];
	output = output.split(')');
	output = output[0];
	output = output.split(',');
	output[0] = output[0].trim().toString();
	output[1] = output[1].trim().toString();

	return output;
}

function cleanResponseTwoPair(input) {
	var output;

	output = input.split('(');
	output = output[1];
	output = output.split(')');
	output = output[0];
	output = output.split(',');
	output[0] = output[0].trim().replace(/[\[\]']+/g,'').toString();
	output[1] = output[1].trim().replace(/[\[\]']+/g,'').toString();
	output[2] = output[2].trim().replace(/[\[\]']+/g,'').toString();
	output[3] = output[3].trim().replace(/[\[\]']+/g,'').toString();
	output = [[output[0],output[1]], [output[2], output[3]]];

	return output;
}
