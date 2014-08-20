(function() { // This app doesn't scale to tens of thousands of users unless they have up several hours and won't close the browser window.
  return {

    users: [],

    requests: {

      url: function(url) {
        return {
          url: url
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
<<<<<<< Updated upstream
      this.getAll('/api/v2/users.json', [], this.doWork);
=======
      this.get_all('allUsers', 10, function(data, context) {
        context.users = context.flatten(data, 'users');
        context.buildList();
      });
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    getAll: function(url, data, fn) {
      if(data === null) {
        data = [];
      }
      if(url === null) {
      fn(data, this);
      } else {
      this.ajax('url', url).done(function(newdata){
      data = data.concat(newdata.users);
      this.getAll(newdata.next_page, data, fn);
      });
      }
    },

    doWork: function(data, that) {
      that.users = data;
      that.buildList();
=======
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
>>>>>>> Stashed changes
    }

  };

}());
