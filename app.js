(function() {
  return {

    users: [],

    requests: {
      allUsers: function(page) {
        return {
          url: helpers.fmt('/api/v2/users.json?page=%@', page),
          type: 'GET',
          contentType: 'application/json'
        };
      }
    },
    
    events: {
      'app.activated':'fetchAllUsers',
      'click .makeusers': 'buildList'

    },
    
    buildList: function() { // Parse results of users in the account

      var suspendedUsersObject = {};
      var data = this.users;

      for (var i = 0; data.users.length > i; i++) { // Loop through all results of users
       
       if (data.users[i].suspended === true) { // If the user is suspended then add their id, name, and email to the new array of user objects
        // console.log("User ID = " + data.users[i].id + " | NAME = " + data.users[i].name + " | EMAIL = " + data.users[i].email);
        // BUILD NEW USER OBJECT FOR SUSPENDED USER HERE
       }

      }

      this.switchTo('draw', {
        users: this.suspendedUsersObject
      });

    },

    // drawList: function() {
    //   this.switchTo('draw', {
    //     users: this.users
    //   });
    // },

    fetchAllUsers: function() {

      return this.promise(
        function(done, fail) {

          this.users = [];

          var fetchedUsers = this._paginate({
            request: 'allUsers',
            entity: 'users',
            page: 1
          });

          fetchedUsers
            .done(_.bind(
              function(data) {
                this.users = data;
                done();
              }, this))
            .fail(_.bind(function() {
              services.notify(
                "Something went wrong and we couldn't reach the REST API to retrieve all user data",
                'error'); //side effect
            }, this));
        }
      );

    },

    _paginate: function(a) { //this just paginates our list of users...utility function.
      var results = [];
      var initialRequest = this.ajax(a.request, a.page);
      var allPages = initialRequest.then(function(data) {
        results.push(data[a.entity]);
        var nextPages = [];
        var pageCount = Math.ceil(data.count / 100);
        for (; pageCount > 1; --pageCount) {
          nextPages.push(this.ajax(a.request, pageCount));
        }
        return this.when.apply(this, nextPages).then(function() {
          var entities = _.chain(arguments)
            .flatten()
            .filter(function(item) {
              return (_.isObject(item) && _.has(item, a.entity));
            })
            .map(function(item) {
              return item[a.entity];
            })
            .value();
          results.push(entities);
        }).then(function() {
          return _.chain(results)
            .flatten()
            .compact()
            .value();
        });
      });
      return allPages;
    }

  };

}());