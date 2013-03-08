$(function() {
// Variables Configuration
  var validCouples = [3, 6, 8, 12, 14, 16, 18, 20, 24, 28, 32, 36]
    , config = {
        couples: validCouples[Math.floor(Math.random() * validCouples.length)],
        id: {
          min: 1,
          max: 480
        }
      };

// Playing Card Distribution
  var couples = config.couples
    , cards = couples * 2;

  for (var n = cards, c = 1; n % 2 === 0 && c < n / 2; c *= 2) {
    n /= 2;
  }

  var rows = c
    , cols = cards / rows;

// Playing Cards Selection
  var minId = config.id.min
    , maxId = config.id.max
    , list = [];
 
  while(list.length < couples) {
    var m = Math.floor((Math.random() * (maxId - minId)) + minId);

    if (maxId - minId <= list.length || $.inArray(m, list) === -1) {
      list.push(m);
    }
  }

// Shuffle The Deck
  $.merge(list, list).sort(function() {
    return 0.5 - Math.random();
  });

// Playing Card HTML Code
  var html = '\
        <div class="card" data-status="hide">\
          <img src="image/card_%id%.jpg" />\
          <img src="image/cover.jpg" data-element="cover" />\
        </div>';

// Print Board and Playing Cards
  $('[data-element="board"]')
    .append(function() {
      var data = '';

      $.each(list, function(index, id) {
        data += html.replace('%id%', id);
      });

      return data;
    })
    .css({
      width: function() {
        return $(this).children().outerWidth(true) * cols;
      },
      height: function() {
        return $(this).children().outerHeight(true) * rows;
      }
    });

// Player Interaction
  var count = 0
    , pair = [];

  $('[data-element="cover"]').on('click', function() {
    count ++;

    if (count <= 2) {
      $(this).slideUp('slow');

      if($(this).parent().attr('data-status') === 'hide') {
        $(this).parent().attr('data-status', 'view');

        pair.push($(this).prev().attr('src'));
      }

      if (count === 2) {
        if (pair[0] === pair[1]) {
          $('[data-status="view"]').attr('data-status', 'show');

          count = 0;

          pair = [];
        } else {
          $('[data-status="view"] [data-element="cover"]').delay(500).slideDown('slow', function(){
            $('[data-status="view"]').attr('data-status', 'hide');

            count = pair.length;

            pair = [];
          });
        }
      }
    }
  });
});