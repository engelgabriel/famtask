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
            member: "Mary"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "John"
          }
        ],
        members: [
          {
            name: "Jonny",
            role: "son",
            avatar: "qwerty"
          },
          {
            name: "Mary",
            role: "mother",
            avatar: "qwerty"
          },
          {
            name: "John",
            role: "father",
            avatar: "qwerty"
          }
        ]
      },
      {name: "The Simpsons",
        todos: [
          {
            text: "Take the trash out",
            points: 50,
            done: "",
            member: "Bart"
          },
          {
            text: "Clean the room",
            points: 250,
            done: "",
            member: "Homer"
          },
          {
            text: "Take the dog for a walk",
            points: 10,
            done: "",
            member: "Lisa"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "Bart"
          }
         ],
         members: [
          {
            name: "Bart",
            role: "son",
            avatar: "qwerty"
          },
          {
            name: "Lisa",
            role: "daughter",
            avatar: "qwerty"
          },
          {
            name: "Meggie",
            role: "daughter",
            avatar: "qwerty"
          },
          {
            name: "Margge",
            role: "mother",
            avatar: "qwerty"
          },
          {
            name: "Homer",
            role: "father",
            avatar: "qwerty"
          }
        ]
      },
      {name: "The Jetsons",
        todos: [
          {
            text: "Take the trash out",
            points: 50,
            done: "",
            member: "Meggie"
          },
          {
            text: "Clean the room",
            points: 250,
            done: "",
            member: "Lisa"
          },
          {
            text: "Take the dog for a walk",
            points: 10,
            done: "",
            member: "Bart"
          },
          {
            text: "Clean the dishes",
            points: 100,
            done: "",
            member: "Bart"
          }
        ],
         members: [
          {
            name: "Bart",
            role: "son",
            avatar: "qwerty"
          },
          {
            name: "Lisa",
            role: "daughter",
            avatar: "qwerty"
          },
          {
            name: "Meggie",
            role: "daughter",
            avatar: "qwerty"
          },
          {
            name: "Margge",
            role: "mother",
            avatar: "qwerty"
          },
          {
            name: "Homer",
            role: "father",
            avatar: "qwerty"
          }
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
      for (var m = 0; m < data[i].members.length; m++) {
        var member = data[i].members[m];
        Members.insert({list_id: list_id,
                      name: member.name,
                      role: member.role,
                      avatar: member.avatar,
                      timestamp: timestamp});
        timestamp += 1; // ensure unique timestamp.
      }
    }
  }
});
