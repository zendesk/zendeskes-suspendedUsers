(function() { // This app doesn't scale to tens of thousands of users unless they have up several hours and won't close the browser window.
  return {

    users: [],

    requests: {
         allUsers: function(page) {
            return {
                url: helpers.fmt('/api/v2/users.json?page=%@', page),
                type: 'GET',
                contentType: 'application/json'
            };
        },
        proxy: function(request) {
          return request;
        }

    },

    events: {
      'click .build': 'init'

    },

    init: function() {
      this.switchTo('loading');
      this.get_all('allUsers', 100, function(data, context) {
        context.users = context.flatten(data, 'users');
        context.buildList();
      });
    },

    buildList: function() { // Parse results of users in the account

      var data = this.users;

      var suspendedUsers = _.filter(data, function(user){ // Filter results of all users down to just suspended users
        return user.suspended === true;
      });

      console.log(suspendedUsers);

      this.switchTo('draw', {
        users: suspendedUsers
      });

    },

    get_all: function(endpoint, workers, finished) {
        this.ajax(endpoint, 1).done(function(data) {
            this.workerCount = workers;
            this.workerID = 0;
            this.data = [];
            var total_pages = Math.ceil(data.count / 100);
            var per_worker = Math.floor(total_pages / workers);
            var final_worker = per_worker + (total_pages % workers);
            var callback = function(data, context) {
                context.data = context.data.concat(data);
                context.workerID = context.workerID + 1;  
                if(context.workerID == context.workerCount) {
                    finished(context.data, context);
                }
            };    
            for(var i = 1; i < workers; i++) {
                var start = per_worker * (i - 1);
                var end = per_worker * i - 1;
                console.log('Worker:' + i);
                this.get_range(endpoint, start, end, callback, []);
            }
            var fstart = total_pages - final_worker;
            console.log('Worker:' + workers);
            this.get_range(endpoint, fstart, total_pages, callback, []);
        });
    },

    get_range: function(endpoint, start, end, callback, data) {
        this.ajax(endpoint, start).done(function(newdata) {
            data = data.concat(newdata);
            console.log(start);
            if(start != end) {
                start = start + 1;
                this.get_range(endpoint, start, end, callback, data);
            }
            else {
                callback(data, this);
            }
        });
    },
    flatten: function(array, item) {
        var data = []
        array.forEach(function(page) {
            data = data.concat(page[item]);
        });
        return data;
    }

  };

}());
