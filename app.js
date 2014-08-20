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

      var data = this.users;

      var suspendedUsers = _.filter(data, function(user){
        return user.suspended === true;
      });

      console.log(suspendedUsers);

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
