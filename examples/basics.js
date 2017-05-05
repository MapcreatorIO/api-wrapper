// this example assumes that an instance of the api exists and is authenticated.
// See the folders node and web for authentication information

// Create a new color and dump the new resource
// to the console after saving
var data = {name: 'Smurf', hex: '88CCFF'};
api.colors.new(data).save().then(console.dir);

// Changes the profession of the current user
api.users.get('me').then(me => {
  me.profession = 'Developer';
  me.save(); // Optional chaining to get the updated resource
});

// Clone resource
api.colors(1).then(color => {
  color.id = null; // Setting the id to null forces the creation of a new object
  color.save();
});

// Listing resources with pagination. First page with 5 items per page
api.colors.list(1, 20).then(page => {
  console.log('Got resources:');

  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());
  }

  page.next().then(page => {

  })
});

// Select current user but do not fetch any info to make fetching resources easier
api.users.select('me').colors().then(page => {
  console.dir(page.data);
});