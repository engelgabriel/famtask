// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  Lists.remove({});
  Todos.remove({});
  if (Lists.find().count() === 0) {
    var timestamp = (new Date()).getTime();
    var data = [
      {name: "The Smiths",
        todos: [
          {
            text: "Take the trash out",
            points: 50,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the room",
            points: 250,
            done: "",
            member: "Jonny"
          },
          {
            text: "Take the dog for a walk",
            points: 10,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "Jonny"
          }
        ],
        members: [
          "Jonny","Mum","Dad"
        ]
      },
      {name: "The Simpsons",
        todos: [
          {
            text: "Take the trash out",
            points: 50,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the room",
            points: 250,
            done: "",
            member: "Jonny"
          },
          {
            text: "Take the dog for a walk",
            points: 10,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "Jonny"
          }
         ],
         members: [
          "Homer","Margge","Bart", "Lisa", "Meggie"
         ]
      },
      {name: "The Jetsons",
        todos: [
          {
            text: "Take the trash out",
            points: 50,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the room",
            points: 250,
            done: "",
            member: "Jonny"
          },
          {
            text: "Take the dog for a walk",
            points: 10,
            done: "",
            member: "Jonny"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "Jonny"
          }
        ],
        members: [
          "Homer","Margge","Bart", "Lisa", "Meggie"
        ]
      }
    ];

    for (var i = 0; i < data.length; i++) {
      var list_id = Lists.insert({name: data[i].name});
      for (var j = 0; j < data[i].todos.length; j++) {
        var info = data[i].todos[j];
        Todos.insert({list_id: list_id,
                      text: info.text,
                      points: info.points,
                      done: info.done,
                      member: info.member,
                      timestamp: timestamp});
        timestamp += 1; // ensure unique timestamp.
      }
    }
  }
});
