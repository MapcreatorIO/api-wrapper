# Basics
These examples assume that an instance of the api exists and is authenticated. 
See the node and web authentication examples for more information on authenticating.

### Getting a resource
Resources are bound to the base api class by default. Resources can be fetched in 
two ways; by selecting them (`.select`) or by fetching them (`.get`). Selecting them will only set the
object's id to it's properties. Fetching a resource

Fetch resource and all it's properties:

```js 
api.colors.get(1).then(function(color) {
    console.log(color.id + " " + color.name + ": " + color.hex);
})
```

Select the current user to quickly obtain related mapstyle sets:

```js
api.users.select('me').mapstyleSets().then(function(sets) {
    for(var i = 0; i < sets.data.length; i++) {
        console.log(sets.data[i].name);
    }
});
```

Selection is only usefull as a stepping stone to related resources that can be easily obtained 
using the id of the parent. Please refer to the [api documentation] for further reference.

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
api.colors.list(1, 5).then(page => {
  console.log('Got resources:');

  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());
  }
});
``` 

Loop over every page and print the result to the console.

```js
function parsePages(page) {
  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());     
  }  
    
  if (page.hasNext) {
    console.log('Grabbing page ' + (page.page + 1));
    page.next().then(parsePage);
  }
}

api.colors
   .list(1, 50)
   .then(parsePages);
```

Loop over all pages and return the data in a promise

```js
function parsePages(page) {
  var data = [];
  
  function parse(page) {
      data = data.concat(page.data);
      
      if(page.hasNext) {
          return page.next().then(parse);
      } else {
          return data;
      }
  }  
    
  return parse(page);
}

api.colors
   .list(1, 50)
   .then(parsePages)
   .then(d => console.log('Total rows: ' + d.length));
```


Select current user but do not fetch any info to make fetching resources easier.

```js
api.users.select('me').colors().then(page => {
  console.dir(page.data);
});
```

### Searching
Resource lists can be queried to search for specific records as follows:

```js
var query = {
  name: '^:test',
  scale_min: ['>:1', '<:10'],
}
api.layers.search(query).then(console.dir);
```

The `search` method is an extension of `list`. This means that `.search({})` is the same as 
`list()`. More information about search query formatting can be found in the [api documentation].
 
[api documepntation]: https://api.beta.maps4news.com/docs/