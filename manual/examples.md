# Basics
These examples assume that an instance of the api exists and is authenticated. 
See the node and web authentication examples for more information on authenticating.


### Create a new resource
Create a new color and dump the new resource to the console after saving
```js
var data = {name: 'Smurf', hex: '88CCFF'};
api.colors.new(data).save().then(console.dir);
```

### Modify a resource
Change profession of the current user and save it.
```js
api.users.get('me').then(me => {
  me.profession = 'Developer';
  me.save(); // Optional chaining to get the updated resource
});
```

### Clone a resource
Setting the id to null forces the creation of a new object upon saving. 
```js
api.colors(1).then(color => {
  color.id = null;
  color.save();
});
```

### Pagination
Listing resources with pagination. First page with 5 items per page
```js
api.colors.list(1, 20).then(page => {
  console.log('Got resources:');

  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());
  }
});
``` 
Loop over every page and print the result to the console.
```js
function parsePages() {
  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());     
  }  
    
  if (page.hasNext) {
    console.log('Grabbing page ' + (page.page + 1));
    page.next().then(parsePage);
  }
}

api.colors.list(1, 50).then(parsePages);
```

Select current user but do not fetch any info to make fetching resources easier.
```js
api.users.select('me').colors().then(page => {
  console.dir(page.data);
});
```