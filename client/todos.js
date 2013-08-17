// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Lists = new Meteor.Collection("lists");
Todos = new Meteor.Collection("todos");
Rewards = new Meteor.Collection("rewards");
Members = new Meteor.Collection("members");

// ID of currently selected list
Session.setDefault('list_id', null);

// Name of currently selected tag for filtering
Session.setDefault('tag_filter', null);

// When adding tag to a todo, ID of the todo
Session.setDefault('editing_addtag', null);

// When editing a list name, ID of the list
Session.setDefault('editing_listname', null);

// When editing todo text, ID of the todo
Session.setDefault('editing_itemname', null);

Session.setDefault('page', 'todos');

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('lists', function () {
  if (!Session.get('list_id')) {
    var list = Lists.findOne({}, {sort: {name: 1}});
    if (list)
      Router.setList(list._id);
  }
});

var todosHandle = null;
var rewardsHandle = null;
var membersHandle = null;
// Always be subscribed to the todos for the selected list.
Deps.autorun(function () {
  var list_id = Session.get('list_id');
  if (list_id) {
    todosHandle = Meteor.subscribe('todos', list_id);
    rewardsHandle = Meteor.subscribe('rewards', list_id);
    membersHandle = Meteor.subscribe('members', list_id);
  } else {
    todosHandle = null;
    rewardsHandle = null;
    membersHandle = null;
  }
});


////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

Template.menu.events({
  'click #todosMenu': function (evt) {
    Router.showTodos();
    Deps.flush();
    return false;
  },
  'click #rewardsMenu': function (evt) {
    Router.showRewards();
    Deps.flush();
    return false;
  },
  'click #membersMenu': function (evt) {
    Router.showMembers();
    Deps.flush();
    return false;
  }
});

Handlebars.registerHelper("pageIsTodos", function() {
  return Session.get('page') === 'todos';
});
Handlebars.registerHelper("pageIsRewards", function() {
  return Session.get('page') === 'rewards';
});
Handlebars.registerHelper("pageIsMembers", function() {
  return Session.get('page') === 'members';
});


Handlebars.registerHelper("todosActive", function() {
  return Session.get('page') === 'todos' ? 'active' : '';
});
Handlebars.registerHelper("rewardsActive", function() {
  return Session.get('page') === 'rewards' ? 'active' : '';
});
Handlebars.registerHelper("membersActive", function() {
  return Session.get('page') === 'members' ? 'active' : '';
});

////////// Lists //////////

Template.lists.loading = function () {
  return !listsHandle.ready();
};

Template.lists.lists = function () {
  return Lists.find({}, {sort: {name: 1}});
};

Template.lists.events({
  'mousedown .list': function (evt) { // select list
    Router.setList(this._id);
  },
  'click .list': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },
  'dblclick .list': function (evt, tmpl) { // start editing list name
    Session.set('editing_listname', this._id);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#list-name-input"));
  }
});

// Attach events to keydown, keyup, and blur on "New list" input box.
Template.lists.events(okCancelEvents(
  '#new-list',
  {
    ok: function (text, evt) {
      var id = Lists.insert({name: text});
      Router.setList(id);
      evt.target.value = "";
    }
  }));

Template.lists.events(okCancelEvents(
  '#list-name-input',
  {
    ok: function (value) {
      Lists.update(this._id, {$set: {name: value}});
      Session.set('editing_listname', null);
    },
    cancel: function () {
      Session.set('editing_listname', null);
    }
  }));

Template.lists.selected = function () {
  return Session.equals('list_id', this._id) ? 'selected' : '';
};

Template.lists.name_class = function () {
  return this.name ? '' : 'empty';
};

Template.lists.editing = function () {
  return Session.equals('editing_listname', this._id);
};

////////// Member //////////

Template.members.loading = function () {
  return membersHandle && !membersHandle.ready();
};

Template.members.members = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  return Members.find(sel, {sort: {points: -1}});
};

////////// Member Task //////////
Template.member_task.loading = function () {

  return todosHandle && !todosHandle.ready();
}

Template.member_task.todos = function () {
  // Determine which members to display in main pane,
  // selected based on list_id and tag_filter.

  var list_id = Session.get('list_id');
  if (!list_id)
    return {};

  var sel = {list_id: list_id};

  return Todos.find(sel, {sort: {timestamp: 1}});
};

Template.member_task.isMembersTask = function (member) {
  return member === this.member;
};


////////// Todos //////////

Template.todos.loading = function () {
  return todosHandle && !todosHandle.ready();
};

Template.todos.any_list_selected = function () {
  return !Session.equals('list_id', null);
};

Template.todos.events(okCancelEvents(
  '#new-todo',
  {
    ok: function (text, evt) {
      var tag = Session.get('tag_filter');
      Todos.insert({
        text: text,
        points: 100,
        list_id: Session.get('list_id'),
        done: false,
        timestamp: (new Date()).getTime(),
        tags: tag ? [tag] : []
      });
      evt.target.value = '';
    }
  }));

Template.todos.todos = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  var tag_filter = Session.get('tag_filter');
  if (tag_filter) sel.tags = tag_filter;
  return Todos.find(sel, {sort: {done: 1, points: -1}});
};

Template.todo_item.tag_objs = function () {
  var todo_id = this._id;
  return _.map(this.tags || [], function (tag) {
    return {todo_id: todo_id, tag: tag};
  });
};

Template.todo_item.members_select = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  return Members.find(sel, {sort: {name: 1}});

};

Template.todo_item.done_class = function () {
  return this.done ? 'todo-done' : '';
};

Template.todo_item.done_checkbox = function () {
  return this.done ? 'checked="checked"' : '';
};

Template.todo_item.editing = function () {
  return Session.equals('editing_itemname', this._id);
};

Template.todo_item.adding_tag = function () {
  return Session.equals('editing_addtag', this._id);
};

Template.member_select.loading = function () {
  return membersHandle && !membersHandle.ready();
};

Template.member_select.members = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  return Members.find(sel, {sort: {name: 1}});
};

Template.member_select.isSelected = function (name) {
  return name === this.name;
};

Template.todo_item.events({
  'click .checkmark': function () {
    Todos.update(this._id, {$set: {done: !this.done}});
  },

  'click .destroy': function () {
    Todos.remove(this._id);
  },

  'click .addtag': function (evt, tmpl) {
    Session.set('editing_addtag', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#edittag-input"));
  },

  'click .todo-points': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#todo-points-input"));
  },

  'click .todo-text': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#todo-text-input"));
  },

  'click .todo-member': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#todo-member-input"));
  },

  'click .remove': function (evt) {
    var tag = this.tag;
    var id = this.todo_id;

    evt.target.parentNode.style.opacity = 0;
    // wait for CSS animation to finish
    Meteor.setTimeout(function () {
      Todos.update({_id: id}, {$pull: {tags: tag}});
    }, 300);
  }
});

Template.todo_item.events(okCancelEvents(
  '#todo-points-input',
  {
    ok: function (value) {
      Todos.update(this._id, {$set: {points: parseInt(value)}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.todo_item.events(okCancelEvents(
  '#todo-text-input',
  {
    ok: function (value) {
      Todos.update(this._id, {$set: {text: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.todo_item.events(okCancelEvents(
  '#todo-member-input',
  {
    ok: function (value) {
      Todos.update(this._id, {$set: {member: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.todo_item.events(okCancelEvents(
  '#edittag-input',
  {
    ok: function (value) {
      Todos.update(this._id, {$addToSet: {tags: value}});
      Session.set('editing_addtag', null);
    },
    cancel: function () {
      Session.set('editing_addtag', null);
    }
  }));

////////// Rewards //////////

Template.rewards.loading = function () {
  return rewardsHandle && !rewardsHandle.ready();
};

Template.rewards.any_list_selected = function () {
  return !Session.equals('list_id', null);
};

Template.rewards.events(okCancelEvents(
  '#new-reward',
  {
    ok: function (text, evt) {
      var tag = Session.get('tag_filter');
      Rewards.insert({
        text: text,
        points: 100,
        list_id: Session.get('list_id'),
        done: false,
        timestamp: (new Date()).getTime(),
        tags: tag ? [tag] : []
      });
      evt.target.value = '';
    }
  }));

Template.rewards.rewards = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  var tag_filter = Session.get('tag_filter');
  if (tag_filter) sel.tags = tag_filter;
  return Rewards.find(sel, {sort: {timestamp: 1}});
};

Template.reward_item.tag_objs = function () {
  var reward_id = this._id;
  return _.map(this.tags || [], function (tag) {
    return {reward_id: reward_id, tag: tag};
  });
};

Template.reward_item.members_select = function () {
  var list_id = Session.get('list_id');
  if (!list_id) return {};
  var sel = {list_id: list_id};
  return Members.find(sel, {sort: {name: 1}});

};

Template.reward_item.done_class = function () {
  return this.done ? 'reward-done' : '';
};

Template.reward_item.done_checkbox = function () {
  return this.done ? 'checked="checked"' : '';
};

Template.reward_item.editing = function () {
  return Session.equals('editing_itemname', this._id);
};

Template.reward_item.adding_tag = function () {
  return Session.equals('editing_addtag', this._id);
};

Template.reward_item.events({
  'click .checkmark': function () {
    Rewards.update(this._id, {$set: {done: !this.done}});
  },

  'click .destroy': function () {
    Rewards.remove(this._id);
  },

  'click .addtag': function (evt, tmpl) {
    Session.set('editing_addtag', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#edittag-input"));
  },

  'click .reward-points': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#reward-points-input"));
  },

  'click .reward-text': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#reward-text-input"));
  },

  'click .reward-member': function (evt, tmpl) {
    Session.set('editing_itemname', this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("#reward-member-input"));
  },

  'click .remove': function (evt) {
    var tag = this.tag;
    var id = this.reward_id;

    evt.target.parentNode.style.opacity = 0;
    // wait for CSS animation to finish
    Meteor.setTimeout(function () {
      Rewards.update({_id: id}, {$pull: {tags: tag}});
    }, 300);
  }
});

Template.reward_item.events(okCancelEvents(
  '#reward-points-input',
  {
    ok: function (value) {
      Rewards.update(this._id, {$set: {points: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.reward_item.events(okCancelEvents(
  '#reward-text-input',
  {
    ok: function (value) {
      Rewards.update(this._id, {$set: {text: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.reward_item.events(okCancelEvents(
  '#reward-member-input',
  {
    ok: function (value) {
      Rewards.update(this._id, {$set: {member: value}});
      Session.set('editing_itemname', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
    }
  }));

Template.reward_item.events(okCancelEvents(
  '#edittag-input',
  {
    ok: function (value) {
      Rewards.update(this._id, {$addToSet: {tags: value}});
      Session.set('editing_addtag', null);
    },
    cancel: function () {
      Session.set('editing_addtag', null);
    }
  }));

////////// Tag Filter //////////

// Pick out the unique tags from all todos in current list.
Template.tag_filter.tags = function () {
  var tag_infos = [];
  var total_count = 0;

  Todos.find({list_id: Session.get('list_id')}).forEach(function (todo) {
    _.each(todo.tags, function (tag) {
      var tag_info = _.find(tag_infos, function (x) { return x.tag === tag; });
      if (! tag_info)
        tag_infos.push({tag: tag, count: 1});
      else
        tag_info.count++;
    });
    total_count++;
  });

  tag_infos = _.sortBy(tag_infos, function (x) { return x.tag; });
  tag_infos.unshift({tag: null, count: total_count});

  return tag_infos;
};

Template.tag_filter.tag_text = function () {
  return this.tag || "All items";
};

Template.tag_filter.selected = function () {
  return Session.equals('tag_filter', this.tag) ? 'selected' : '';
};

Template.tag_filter.events({
  'mousedown .tag': function () {
    if (Session.equals('tag_filter', this.tag))
      Session.set('tag_filter', null);
    else
      Session.set('tag_filter', this.tag);
  }
});

////////// Tracking selected list in URL //////////

var TodosRouter = Backbone.Router.extend({
  routes: {
    // "": "main",
    "todos": "todos",
    "rewards": "rewards",
    "members": "members",
    "member/:member_id": "member"
  },
  main: function (list_id) {
  //   this.navigate('todos', true);
  },
  todos: function () {
    Session.set("page", "todos");
  },
  members: function () {
    Session.set("page", "members");
  },
  rewards: function () {
    Session.set("page", "rewards");
  },
  setList: function (list_id) {
    Session.set("list_id", list_id);
  },
  showTodos: function () {
    this.navigate('todos', true);
  },
  showRewards: function () {
    this.navigate('rewards', true);
  },
  showMembers: function () {
    this.navigate('members', true);
  },
  showMember: function () {
    this.navigate('member/'+Session.get("member_id"), true);
  }
});

Router = new TodosRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
