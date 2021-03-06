"use strict";

define(
	[
		'flight/component',
		'text!/app/templates/tile.html',
		'../utils'
	],
	function(defineComponent, tileTemplate, utils) {

		return defineComponent(tileGroup);

		function tileGroup() {

			this.TILE_TEMPLATE = utils.tmpl(tileTemplate);

			this.defaultAttrs({
				individualTile: '.tile'
			});

			// Create a set of arrangements to pick from.
			// layout.map maps the position in the final layout to article rank.
			var LAYOUTS = [
				{ sizes: [ '3x2', '2x2', '2x1', '1x1', '1x1', '1x1', '1x1'],
					map: [6, 0, 1, 2, 3, 4, 5] },
				{ sizes: [ '3x2', '2x2', '2x2', '1x1', '1x1'],
					map: [0, 1, 2, 3, 4] },
				{ sizes: [ '2x2', '2x1', '2x1', '2x1', '2x1', '1x1', '1x1', '1x1', '1x1'],
					map: [1, 2, 3, 0, 6, 4, 5, 7, 8] },
				{ sizes: [ '3x2', '2x2', '2x1', '1x1', '1x1', '1x1', '1x1'],
					map: [0, 6, 1, 5, 3, 4, 2] },
				{ sizes: [ '3x2', '2x1', '2x1', '2x1', '2x1', '1x1', '1x1'],
					map: [2, 1, 3, 0, 4, 5, 6] 
				},
			];

			this.layout = LAYOUTS[Math.floor(Math.random()*LAYOUTS.length)];

			this.renderAll = function(e, data) {
				var _this = this;
				var articles = [];
				var tiles = [];

				// Sort articles by popularity in descending order.
				this.articles = _.sortBy(data.articles, "popularity").reverse();
				var num_shown = this.layout.sizes.length;

				// Link articles to a size.
				for(var i=0; i<num_shown; i++){
					var article = this.articles[i];
					article.size = this.layout.sizes[i];
					articles.push(article);
					tiles.push(null);
				}

				// Order the articles.
				for(var i=0; i<num_shown; i++){
					tiles[i] = articles[this.layout.map[i]];
				}

				// Render every tile.
				this.$node.html('');
				_.map(tiles, function(tile){ _this.render(e, {tile: tile}); });

				// Compute the optimal arrangement
				var container = document.querySelector('#tileContainer');
				var pckry = new Packery( container, {
				  // options
				  itemSelector: '.tile',
				  gutter: 20,
				  columnWidth: 245,
				  containerStyle: null
				});
			}

			this.render = function(e, data) {
				this.$node.append(this.TILE_TEMPLATE(data.tile));
			}

			this.populateFeaturedTile = function(e, data) {
				this.trigger(document, 'showFeaturedTile');
			}

			this.after('initialize', function() {
				var self = this;
				this.on('click', {'individualTile': this.populateFeaturedTile});
				this.on(document, 'dataFetched', this.renderAll);

				this.worker.addEventListener('message', function(event) {
					self.trigger(document, 'dataFetched', event.data);
				});

				this.worker.postMessage("sync");
			});

			this.worker = new Worker("/app/js/workers/sync.js");
		}
	}
);