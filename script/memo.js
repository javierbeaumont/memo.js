$(function() {
// Variables Configuration
  const emojis = [
        'Alien', 'Ant', 'Avocado', 'Banana', 'Bat', 'Bear', 'Beaver', 'Bird', 'Boar', 'Bug',
        'Butterfly', 'Cactus', 'Cat', 'Chicken', 'Chipmunk', 'Cockroach', 'Cookie', 'Cow', 'Crab',
        'Cricket', 'Crocodile', 'Crown', 'Dodo', 'Dog', 'Dolphin', 'Donkey', 'Dragon', 'Duck', 'Eagle',
        'Elephant', 'Ewe', 'Fish', 'Flamingo', 'Fox', 'Frog', 'Ghost', 'Giraffe', 'Goat', 'Gorilla',
        'Hamster', 'Hedgehog', 'Hippopotamus', 'Honeybee', 'Horse', 'Kangaroo', 'Koala', 'Lady beetle',
        'Leopard', 'Lion', 'Lizard', 'Llama', 'Lobster', 'Mammoth', 'Monkey', 'Mosquito', 'Mouse',
        'Mushroom', 'Octopus', 'Otter', 'Owl', 'Panda', 'Parrot', 'Peacock', 'Penguin', 'Pig', 'Pizza',
        'Polar bear', 'Rabbit', 'Raccoon', 'Ram', 'Rat', 'Rhinoceros', 'Robot', 'Rocket', 'Rooster',
        'Rose', 'Sauropod', 'Scorpion', 'Seal', 'Shark', 'Shrimp', 'Skunk', 'Sloth', 'Snail', 'Snake',
        'Snowflake', 'Spider', 'Strawberry', 'Sunflower', 'Swan', 'Teddy bear', 'Tiger', 'Turkey',
        'Turtle', 'Unicorn', 'Watermelon', 'Whale', 'Wolf', 'Zebra'
      ];

  const validCouples = [3, 6, 8, 12, 14, 16, 18, 20, 24, 28, 32, 36]
    , config = {
        couples: validCouples[Math.floor(Math.random() * validCouples.length)],
        id: {
          min: 0,
          max: emojis.length
        }
      };

// Playing Card Distribution
  const couples = config.couples
    , cards = couples * 2;

// Lists all divisors from number of playing cards
  const l = [];

  for (let d = 1; d <= cards; d++){
    if(cards % d === 0) {
      l.push(d);
    }
  }

// Select best divisors from the list
  const w = (l.length % 2 === 0) ? [1, 0] : [.5, .5]
    , rows = l[l.length / 2 - w[0]]
    , cols = l[l.length / 2 - w[1]];

// Playing Cards Selection
  const minId = config.id.min
    , maxId = config.id.max
    , list = [];

  while(list.length < couples) {
    const m = Math.floor((Math.random() * (maxId - minId)) + minId);

    if (maxId - minId <= list.length || $.inArray(m, list) === -1) {
      list.push(m);
    }
  }

// Shuffle The Deck (Fisher-Yates)
  $.merge(list, list);

  for (let position = list.length - 1; position > 0; position--) {
    const randomIndex = Math.floor(Math.random() * (position + 1))
      , card = list[position];

    list[position] = list[randomIndex];
    list[randomIndex] = card;
  }

// Playing Card HTML Code
  const html = '\
        <div class="card" data-status="hide">\
          <img src="image/%src%" />\
          <div data-element="cover"></div>\
        </div>';

// Print Board and Playing Cards
  $('[data-element="board"]')
    .append(function() {
      let data = '';

      $.each(list, function(index, id) {
        const file = emojis[id].toLowerCase().replace(/ /g, '_') + '_3d.png';

        data += html.replace('%src%', file);
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
  let count = 0
    , pair = []
    , locked = false;

  $('[data-element="cover"]').on('click', function() {
    if (locked) return;                                          // two cards are flipping back
    if ($(this).parent().attr('data-status') !== 'hide') return; // card already flipped

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
          locked = true;

          $('[data-status="view"] [data-element="cover"]').delay(500).slideDown('slow', function(){
            $('[data-status="view"]').attr('data-status', 'hide');

            count = pair.length;

            pair = [];

            locked = false;
          });
        }
      }
    }
  });
});