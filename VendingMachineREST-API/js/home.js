
//global variable
var balance;

$(document).ready(function () {

	clearAll();
	loadVendingMachine();
	insertDollar();
	insertQuarter();
	insertDime();
	insertNickel();
	getChange();
	purchaseItem();

	$('h2').css('color', 'orange');
	$('#vending-items').css({'color':'whitesmoke', 'font-family':'Arial Narrow Bold'});
	
	
});




function loadVendingMachine() {
	
	$('#errorMessages').empty();
	clearVendingMachine();
	var contentRows = $('#vending-items');

	//ajax call
	//display vending items and info in vending machine api
	$.ajax({
		type: 'GET',
		url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
		success: function (itemsArray) {

			var itemInfo = '<div class="row">';

			$.each(itemsArray, function (_index, item) {
				itemInfo += '<div class = "vending-items col-sm-4" style = text-align:center; margin-bottom: 30px; margin-top 30px;">';
				itemInfo += '<button type="button" class="btn btn-primary" onclick = "selectItem(' + item.id + ')"><p style ="text-align: left; color: orange";>' + item.id + '</p>';
				itemInfo +=  item.name + '<br>';
				itemInfo += '$' + item.price.toFixed(2) + '<br>';
				itemInfo += 'Quantity Left: ' + item.quantity + '<br></a><br>';
				itemInfo += '</div>';
			})
			contentRows.append(itemInfo);
		},
		error: function () {
			$('#errorMessages')
				.append($('<li>')
					.attr({ class: 'list-group-item list-group-item-danger' })
					.text('Error calling web service.  Please try again later.'));
		}
	})
}

//money-input functions()

    loadItems();    
function insertDollar() {
	$('#add-dollar-button').click(function () {
		balance = +$('#money-input').val();
		balance = balance + 1.00;
		$('#money-input').val(balance.toFixed(2));
	});
}


function insertQuarter() {
	$('#add-quarter-button').click(function () {
		balance = +$('#money-input').val();
		balance = balance + 0.25;
		$('#money-input').val(balance.toFixed(2));
	});
}


function insertDime() {
	$('#add-dime-button').click(function () {
		balance = +$('#money-input').val();
		balance = balance + 0.10;
		$('#money-input').val(balance.toFixed(2));
	});
}


function insertNickel() {
	$('#add-nickel-button').click(function () {
		balance = +$('#money-input').val();
		balance = balance + 0.05;
		$('#money-input').val(balance.toFixed(2));
	});
}
//ajax call
//get change function()
function getChange() {
	$('#return-change').click(function () {

		if ($('#money-input').val() == '') {
			$('#change-input-box').val('No Change');
			$('#item-to-vend').val('');
			$('#money-input').val('');
			return false;
		}
		//variable set up
		balance = +$('#money-input').val();
		balance = balance * 100;

		//calculates number of each coin

		var numQuarters = Math.floor(balance / 25);
		balance = balance - (numQuarters * 25);

		var numDimes = Math.floor(balance / 10);
		balance = balance - (numDimes * 10);

		var numNickels = Math.floor(balance / 5);
		var numPennies = balance - (numNickels * 5);

		numPennies = Math.floor(numPennies);

		//displays change to user
		changeMessage(numQuarters, numDimes, numNickels, numPennies);
		$('#vending-message').val('');
	});


}

//emptys out the main table
function clearVendingMachine() {
	$('#vending-items').empty();
	
}

// selects item and makes id visible to user
function selectItem(id) {
	$('#item-to-vend').val(id);
}

//purchases item from vending machine api
function purchaseItem() {
	$('#purchase-button').click(function () {
		//clears any displayed messages
		$('#vending-message').val('');

		//if no item selected display an error and ends program
		if ($('#item-to-vend').val() == '') {
			$('#vending-message').val('Please make a selection');
			$('#change-input-box').val('');
			return false;
		}
		//gets the current balance 
		var id = $('#item-to-vend').val();
		balance = +$('#money-input').val();


		//calls api with the item id and money inserted
		$.ajax({
			type: 'POST',
			url: 'http://vending.us-east-1.elasticbeanstalk.com/money/' + balance + '/item/' + id,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			'dataType': 'json',
			success: function (change) {
				//takes the change returned and converts it into a string to be displayed to user
				changeMessage(change.quarters, change.dimes, change.nickels, change.pennies)
				//prints thank you message confirming success
				$('#vending-message').val('Thank You!!');
				loadVendingMachine();
			},
			error: function (message) {
				//parses the message returned from json object in the event of purchase failure and displays to user
				var error = JSON.parse(message.responseText);
				$('#vending-message').val(error.message);
			}
		});
	});
}
//ensure all readonly inputs are clear on load
function clearAll() {
	$('#vending-message').val('');
	$('#change-input-box').val('');
	$('#item-to-vend').val('');
	$('#money-input').val('0.00');

}

//creates a message depending on coins to display to user
function changeMessage(numQuarters, numDimes, numNickels, numPennies) {
	var returnedBalance = '';
	if (numQuarters > 0) {
		if (numQuarters == 1) {
			returnedBalance += numQuarters + ' Quarter, ';
		} else {
			returnedBalance += numQuarters + ' Quarters, ';
		}
	}
	if (numDimes > 0) {
		if (numDimes == 1) {
			returnedBalance += numDimes + ' Dime, ';
		} else {
			returnedBalance += numDimes + ' Dimes, ';
		}
	}
	if (numNickels > 0) {
		if (numNickels == 1) {
			returnedBalance += numNickels + ' Nickel, ';
		} else {
			returnedBalance += numNickels + ' Nickels, ';
		}
	}
	if (numPennies > 0) {
		if (numPennies == 1) {
			returnedBalance += numPennies + ' Penny';
		} else {
			returnedBalance += numPennies + ' Pennies';
		}
	}
	$('#change-input-box').val(returnedBalance);
	$('#money-input').val('0.00');
	$('#item-to-vend').val('');


}
