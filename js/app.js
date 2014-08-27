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
        this.offset = 0;
        this.num_listings = 20;

    }

    //===========================//
    //      Get Listings based   //
    //      on query input       //
    //      (or lack thereof)    //
    //===========================//

    EtsyClient.prototype.getListings = function(query, pricemin, pricemax) {

        var model = 'listings/';
        var filter = 'active';
        var self = this;
        if (!pricemax) {
            var complete_api_URL = (this.etsy_url + this.version + model + filter + ".js?limit=" + this.num_listings + "&min_price=" + pricemin + "&offset=" + this.offset + "&includes=MainImage&api_key=" + this.api_key + "&callback=?");
        } else {
            var complete_api_URL = (this.etsy_url + this.version + model + filter + ".js?limit=" + this.num_listings + "&min_price=" + pricemin + "&max_price=" + pricemax + "&offset=" + this.offset + "&includes=MainImage&api_key=" + this.api_key + "&callback=?");
        };
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

    EtsyClient.prototype.showListings = function(query, pricemin, pricemax) {
        var self = this;
        var all_Listings = '';
        $.when(
            this.templateResults(
                '../templates/ListingsResult.tmpl'),
            this.getListings(query, pricemin, pricemax)
        ).then(function(template, listings) {
            console.log(listings[0]);
            results_amount = listings[0].count;
            var search_results = listings[0].results;
            search_results = _.filter(search_results, function(listing) {
                return (listing.state === "active");
            })
                    //use the following line if there's a state issue:
                    // console.log(oneListing.state)
            search_results.forEach(
                function(oneListing) {
                    if (oneListing.title.length >= 35) {
                        oneListing.short_title = (oneListing.title.substring(0, 35)) + '...';
                    } else if (oneListing.title.length < 35) {
                        oneListing.short_title = oneListing.title;
                    };
                    var filledHTML = template(oneListing);
                    all_Listings += filledHTML;
                });
            $('.listingsNav').fadeIn(400);
            $('.ListingsDestination')[0].innerHTML = all_Listings;
            $('.results')[0].innerText = 'Viewing ' + (self.offset + 25) + ' results out of ' + results_amount;
            $('.contentBlock').fadeIn(800);

        })
    }

    EtsyClient.prototype.getListingInfo = function(id) {
        //this is run when the user clicks on one of the listings. The listings change the PATH, which triggers the js to run this function with the id provided by the link (put in by showlistings)
        var model = 'listings';
        return $.getJSON(this.etsy_url + this.version + model + '/' + id + ".js?&includes=Images&api_key=" + this.api_key + "&callback=?");
    }

    EtsyClient.prototype.showListingInfo = function(id) {
        var self = this;
        $.when(
            this.templateResults('../templates/IndividualListing.tmpl'),
            this.getListingInfo(id)
        ).then(function(templateFn, listing) {
            console.log(listing[0]);
            var listingInfo = listing[0].results;
            var FilledListing = templateFn(listingInfo[0]);
            $('.hoverListing')[0].innerHTML = FilledListing;
        })
    }

    EtsyClient.prototype.showRandomListing = function() {
        var self = this;
        if (typeof results_amount === 'undefined') {
            alert('Please wait for the page to fully load.')
        };
        var randomOffset = Math.floor(Math.random() * (results_amount - this.num_listings));
        var randomListing = Math.floor(Math.random() * this.num_listings);
        var uriForRandomJSON = this.etsy_url + this.version + "listings/active" + ".js?limit=" + this.num_listings + "&min_price=100000&offset=" + randomOffset + "&includes=Images&api_key=" + this.api_key + "&callback=?";
        console.log(randomOffset + " out of " + results_amount);
        // $('.ListingsDestination')[0].innerHTML = '';

        $.when(
            this.templateResults('../templates/IndividualListing.tmpl'),
            $.getJSON(uriForRandomJSON)
        ).then(function(templateFn, listings) {
            console.log(listings[0].results[randomListing]);
            var FilledListing = templateFn(listings[0].results[randomListing]);
            $('.hoverListing')[0].innerHTML = FilledListing;
        });
        //.when(
        //3. getListings with offset from step 1
        //4. show listing information of item in array place number chosen in step 2
        //)
        //
        this.offset = 0;
    }

    EtsyClient.prototype.showClearance = function() {
        $('.ListingsDestination')[0].innerHTML = '';
        this.showListings('', 10000, 10000);

    }

    EtsyClient.prototype.handleClickEvents = function() {

        //  Opening the modal
        var self = this;
        $('body').on('click', '.Listing', function() {
            // $.when(
            //     this.showListingInfo())
            var targetID = event.target.id;
            $.when(
                self.showListingInfo(targetID)
            ).then(function() {
                $('body').toggleClass('noScroll');
                $('#hoverListing').toggleClass('listingBox');
            });
        });

        //  Closing the modal
        $('body').on('click', '.mask', function() {
            $('body').toggleClass('noScroll');
            $('#hoverListing').toggleClass('listingBox');
        });
        $('body').on('click', '.closeButton', function() {
            $('body').toggleClass('noScroll');
            $('#hoverListing').toggleClass('listingBox');
        });

        //  Clearance Section Click
        $('body').on('click', '.clearance', function() {
            self.showClearance();
            setTimeout(function() {
                //the following line is useful for showing timing of display:
                // console.log($(".saleBanner").css('display'), ($(".saleBanner").css('display') == "none"));
                if ($(".saleBanner").css('display') == "none") {
                    $(".saleBanner").toggle();
                    // css('display')) = "block";
                    // $(".saleBanner").toggle();
                };
            }, 2500)

        });


        //  Gallery Click
        $('body').on('click', '.gallery', function() {
            // first checks to see if Listings are shown, and if they're the clearance section
            if ($(".ListingsDestination") !== "" && $(".saleBanner").css('display') == "block") {
                $(".ListingsDestination")[0].innerHTML = "";
                self.showListings('', 100000, '');
            }

            // next checks if Listings are there and not in the clearance section
            else if ($(".ListingsDestination") !== "" && $(".saleBanner").css('display') == "none") {
                //this section will eventually be changed when the categories are working
                console.log("already displaying gallery")
                return;
            }

            // lastly, checks if Listings are not there
            else if ($(".ListingsDestination")[0].innerHTML === "") {
                console.log('test');
                self.showListings('', 100000, '');

            }


        });


        //  Random Listing Click
        $('body').on('click', '.random', function() {
            //if listingBox is present, the modal is not on; show the modal and run the function.
            if ($("#hoverListing").hasClass('listingBox')) {
                $.when(
                    self.showRandomListing()
                ).then(function() {
                    $('body').toggleClass('noScroll');
                    $('#hoverListing').toggleClass('listingBox');
                });
            }

            //if listingBox is not present, the modal is on; run the function only.
            else {
                self.showRandomListing();
            }
        });


        //  Displaying/Hiding prices
        $('body').on('click', '.priceButton', function() {
            $(".priceDisplay").toggle();
            $(".priceSection").toggleClass("ps_off_BG");
            $(".priceSection").toggleClass("ps_on_BG");
        });


        //Handling sorting box
        //involves:
        //$("select").change(function() {
        //     var selectedSorting = ($(this).val());
        //     console.log(selectedSorting);
        // });
    }

    var Affluentsy = new EtsyClient;
    Affluentsy.showListings('', 100000, '');
    Affluentsy.handleClickEvents();
    console.log(($("saleBanner").css("display")));
}

//need routing prototype
//need history thingie
//need 'new Router'
//need create view (appends things to the dom)

window.onload = app;

Parse.initialize("2OeV2RO4epMFBZz5wcSLNrEQNqXbe76jUmJrAcIM", "PxkEISzj9UcYsbLSMLn3SeOnPsNaKkRg4v4TRRva");
