;

$(document).ready(function() {
	
	var game = new Game({ 
		grid: { 
			columns: 4,
			rows: 4
		},
		tile: {
			width: 60,
			height: 60
		},
		goal: 2048
	});

	game.draw();
	game.reset();

	game.__str__();

	document.onkeydown = function() {

	    switch (window.event.keyCode) {
	        case 37:
	        	game.move(game.directions.left);
	            break;
	        case 38:
	        	game.move(game.directions.up);
	            break;
	        case 39:
	        	game.move(game.directions.right);
	            break;
	        case 40:
	        	game.move(game.directions.down);
	            break;
	    }
	};
});



function Game(config) {

	var self = this;
	var grid = config.grid;
	var goal = config.goal;

	if (grid.columns>10) { grid.columns = 10; }
	if (grid.rows>10) { grid.rows = 10; }

	var tiles = [];

	var getInitialLine = function(current, dir) {
		var line = [];
		while (1) {
			line.push(new Array(current[0], current[1]));
			current[0] += dir[0];
			current[1] += dir[1];
			if (current[0]>=grid.columns || current[1]>=grid.rows) {
				break;
			}
		}
		return line;
	};

	this.directions = {
		up: {
			initialLine: getInitialLine([0,0], [1,0]),
			offset: [0, 1],
			max: grid.rows
		},
		down: {
			initialLine: getInitialLine([0, grid.rows-1], [1,0]),
			offset: [0, -1],
			max: grid.rows
		},
		left: {
			initialLine: getInitialLine([0,0], [0,1]),
			offset: [1, 0],
			max: grid.columns
		},
		right: {
			initialLine: getInitialLine([grid.columns-1,0], [0,1]),
			offset: [-1, 0],
			max: grid.columns
		}
	}

	this.reset = function() {
		tiles = [];
		for (var i=0; i<grid.columns; i++) {
			var column = [];
			for (var j=0; j<grid.rows; j++) {
				column.push(0);
			}
			tiles.push(column);
		}
		this.new_tile();
		this.new_tile();
	}

	this.checkGoal = function() {
		var isGoal = false;
		for (var i=0; i<grid.columns; i++) {
			for (var j=0; j<grid.rows; j++) {
				if (goal>0 && get_tile(i, j)>=goal) {
					isGoal = true;
					break;
				}
			}
		}
		if (isGoal) {
			setTimeout(function() {
				var answer = confirm('You won! Would you like to continue the game?');
				if (answer==true) {
					goal = -1;
				} else {
					self.reset();
				}
			}, 500);
		}
	}

	var ifCanMatch = function(index_x, index_y) {
		var canMove = false;
		var value = get_tile(index_x, index_y);
		if (index_x-1>=0 && get_tile(index_x-1, index_y)==value) {
			canMove = true;
		}
		if (index_x+1<grid.columns && get_tile(index_x+1, index_y)==value) {
			canMove = true;
		}
		if (index_y-1>=0 && get_tile(index_x, index_y-1)==value) {
			canMove = true;
		}
		if (index_y+1<grid.rows && get_tile(index_x, index_y+1)==value) {
			canMove = true;
		}
		return canMove;
	}

	this.checkGameOver = function() {
		var isFull = true;
		for (var i=0; i<grid.columns; i++) {
			for (var j=0; j<grid.rows; j++) {
				if (get_tile(i,j)==0) {
					isFull = false;
				}
			}
		}
		var canAnyMove = false;
		for (var i=0; i<grid.columns; i++) {
			for (var j=0; j<grid.rows; j++) {
				if (!canAnyMove) {
					canAnyMove = ifCanMatch(i,j);
				}
			}
		}
		if (isFull && !canAnyMove) {
			setTimeout(function() {
				alert('Game Over');
				self.reset();
			}, 500);
		}
	}

	this.move = function(dir) {
		var initial = dir.initialLine;
		var offset = dir.offset;
		var max = dir.max;
		var changed = false;

		initial.forEach(function(tile) {
			var temp_line = [];

			for (var j=0; j<max; j++) {
				var current = [tile[1]+(j*offset[1]), tile[0]+(j*offset[0])];
				temp_line.push(get_tile(current[0], current[1]));
			}

			temp_line = merge(temp_line);

			for (var j=0; j<max; j++) {
				var current = [tile[1]+(j*offset[1]), tile[0]+(j*offset[0])];
				if (get_tile(current[0], current[1])!=temp_line[j]) {
					changed = true;
				}
				set_tile(current[0], current[1], temp_line[j]);
			}
		});
		if (changed) {
			this.new_tile();
			this.checkGoal();
			this.checkGameOver();
		}
	}

	this.get_grid_width = function() {
		return grid.columns;
	}
	this.get_grid_height = function() {
		return grid.rows;
	}
	var get_tile = function(col, row) {
		return tiles[col][row];
	}
	var set_tile = function(col, row, val) {
		tiles[col][row] = val;
	}


	this.new_tile = function() {
		var slots = [];
		for (var i=0; i<grid.columns; i++) {
			for (var j=0; j<grid.rows; j++) {
				if (get_tile(i, j)==0) {
					slots.push([i, j]);
				}
			}
		}
		var randomSlot = Math.floor((Math.random() * slots.length));
		var value = (Math.floor((Math.random() * 100))<90) ? 2 : 4;
		set_tile(slots[randomSlot][0], slots[randomSlot][1], value);
		draw_tiles();
	}

	//drawing
	this.draw = function() {
		var $board = $('.board');
		var $tile = $board.find('.tile-bg');
		var str = "";

		for (var j=0; j<grid.rows; j++) {
			var classs="new-row";
			for (var i=0; i<grid.columns; i++) {
				$board.append(getTileString({ class: classs }));
				classs = "";
			}
		}
		$tile.hide();
	}
	var draw_tiles = function() {
		var $board = $('.area');
		var $tile = $('<div>').addClass('tile').addClass('tile-play');

		var $toRemove = $board.find('.tile-play');
		$toRemove.remove();

		for (var j=0; j<grid.rows; j++) {
			for (var i=0; i<grid.columns; i++) {
				if (get_tile(i, j)!=0) {
					var offset = [60*i, 60*j];
					var value = get_tile(i, j);
					var classs = 'tile-' + value;
					$tile.clone().appendTo($board)
						.text(value)
						.css({ top: offset[0], left: offset[1] })
						.addClass(classs);
				}
			}
		}
	}

	//debug
	this.__str__ = function() {
		console.log("");
		for (var i=0; i<grid.columns; i++) {
			var str = "";
			for (var j=0; j<grid.rows; j++) {
				str += get_tile(i, j) + " ";
			}
			console.log(str, "");
		}
	}
}



////////////////////////
//Functions//

function merge(line) {

	var newLine = [];
	var lastWasMerged = true;

	//put non zero values to the new line
	for (var i=0; i<line.length; i++) {
		if (line[i]!=0) {
			if (newLine.length>0 && line[i]==newLine[newLine.length-1] && !lastWasMerged) {
				newLine[newLine.length-1] += line[i];
				lastWasMerged = true;
			} else {
				newLine.push(line[i]);
				lastWasMerged = false;
			}
		}
	}
	//add zeros to the rest of the slots
	for (var i=newLine.length; i<line.length; i++) {
		newLine.push(0);
	}
	return newLine;
}

function getTileString(options) {
	var s = "<div class='tile tile-bg " + options.class + "'></div>";
	return s;
}