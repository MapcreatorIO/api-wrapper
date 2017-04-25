class Color {
  constructor() {

  }
}


new Color("my cool color", "#123456").save()

const color = new Color({name: 'blah'});
color.save();

api.colors.update(1, {});
api.colors.create({})
api.colors.get(1)

api.jobs.get(1).then(job => {
  job.revisions.list().then(revisions => {

  })
})

class Crud {

  constructor(data = {}) {

  }

  save() {
    // if id is not set create new
  }

  delete() {

  }

  restore() {

  }


}

class QueryBuilder {
  get(id) {

  }

  list() {

  }

  update(id, data) {

  }

  delete(id) {

  }

  restore(id) {

  }

  create(data) {

  }
}

const color = new Color(response.data)

this.apply({})

function save() {
  if(this.properties.id) {

  } else {

  }
}