// Lists -- {name: String}
Lists = new Meteor.Collection("lists");

// Publish complete set of lists to all clients.
Meteor.publish('lists', function () {
  return Lists.find();
});


// Todos -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           list_id: String,
//           timestamp: Number}
Todos = new Meteor.Collection("todos");

// Publish all items for requested list_id.
Meteor.publish('todos', function (list_id) {
  check(list_id, String);
  return Todos.find({list_id: list_id});
});

// Rewards -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           list_id: String,
//           timestamp: Number}
Rewards = new Meteor.Collection("rewards");

// Publish all items for requested list_id.
Meteor.publish('rewards', function (list_id) {
  check(list_id, String);
  return Rewards.find({list_id: list_id});
});

// Members -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           list_id: String,
//           timestamp: Number}
Members = new Meteor.Collection("members");

// Publish all items for requested list_id.
Meteor.publish('members', function (list_id) {
  check(list_id, String);
  return Members.find({list_id: list_id});
});

