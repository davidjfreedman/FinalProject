function app() {

    //===========================//
    //      Make NavBar fixed    //
    //        on scroll          //
    //===========================//

    var header = document.querySelector('.mainHeader');
    var sidebar = document.querySelector('.sideBar');
    var content = document.querySelector('.contentBlock')
    var pusher = document.querySelector('.verticalPusher');

    $(window).on('scroll', function() {
        if (window.scrollY >= pusher.offsetHeight) {
            $(header).addClass('active');
            $(sidebar).addClass('active');
            $(content).addClass('active');
        } else {
            $(header).removeClass('active');
            $(sidebar).removeClass('active');
            $(content).removeClass('active')

        }
    });

    $(window).trigger('scroll')

    //=======================//
    //      Constructor      //
    //=======================//

    function EtsyClient() {
        this.api_key = 'dusjvhvvjx2vwfb5hjlb3li6';
        this.etsy_url = 'https://openapi.etsy.com/';
        this.version = 'v2/';
        this.offset = 0
    }

    //===========================//
    //      Get Listings based   //
    //      on query input       //
    //      (or lack thereof)    //
    //===========================//

    EtsyClient.prototype.getListings = function(query) {

        var model = 'listings/';
        var filter = 'active';
        var self = this;
        var num_listings = 20;
        var min_price = 100000;

        var complete_api_URL = (this.etsy_url + this.version + model + filter + ".js?limit=" + num_listings + "&min_price=" + min_price + "&offset=" + this.offset + "&includes=MainImage&api_key=" + this.api_key + "&callback=?");
        if (!query) {
            return $.getJSON(complete_api_URL);
        }
    }

    // elses (if string, if number, multistring, errors)
    // } else if (typeof query === 'string')

    EtsyClient.prototype.templateResults = function(url) {
        return $.get(url).then(function(my_template) {
            findVariables = _.template(my_template);
            return findVariables;
        });
    };

    EtsyClient.prototype.showListings = function(id) {
        var self = this;
        var all_Listings = '';
        $.when(
            this.templateResults(
                '../templates/ListingsResult.tmpl'),
            this.getListings()
        ).then(function(template, listings) {
            console.log(listings[0]);
            var results_amount = listings[0].count;
            var search_results = listings[0].results;
            search_results.forEach(
                function(oneListing) {
                    oneListing.short_title = (oneListing.title.substring(0, 25)) + '...';
                    var filledHTML = template(oneListing);
                    all_Listings += filledHTML;
                });
            $('.listingsNav').fadeIn(400);
            $('.ListingsDestination')[0].innerHTML = all_Listings;
            $('.results')[0].innerText = 'Viewing ' + (self.offset + 25) + ' results out of ' + results_amount;
            $('.contentBlock').fadeIn(800);

        })
    }

    EtsyClient.prototype.handleClickEvents = function() {
        $('body').on('click', '.Listing', function() {
            $('body').toggleClass('noScroll');
            $('#hoverListing').toggleClass('listingBox');
        });
        $('body').on('click', '.mask', function() {
            $('body').toggleClass('noScroll');
            $('#hoverListing').toggleClass('listingBox');
        });
    }

    EtsyClient.prototype.getListingInfo = function(id) {
        //this is run when the user clicks on one of the listings. The listings change the PATH, which triggers the js to run this function with the id provided by the link (put in by showlistings)
        var model = 'listings';
        return $.getJSON(this.complete_api_url + model + '/' + id + ".js?api_key=" + this.api_key + "&callback=?").then(function(data) {
            console.log(data);
        });
    }

    EtsyClient.prototype.showListingInfo = function(id) {}



    var Affluentsy = new EtsyClient;
    Affluentsy.showListings();
    Affluentsy.handleClickEvents();

}

//need routing prototype
//need history thingie
//need 'new Router'
//need create view (appends things to the dom)

window.onload = app;

Parse.initialize("2OeV2RO4epMFBZz5wcSLNrEQNqXbe76jUmJrAcIM", "PxkEISzj9UcYsbLSMLn3SeOnPsNaKkRg4v4TRRva");
