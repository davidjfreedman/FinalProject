function app() {

    //===========================//
    //      Make NavBar fixed    //
    //        on scroll          //
    //===========================//

    var header = document.querySelector('.mainHeader');
    // var sidebar = document.querySelector('.sideBar');
    var content = document.querySelector('.contentBlock')
    var pusher = document.querySelector('.verticalPusher');

    $(window).on('scroll', function() {
        if (window.scrollY >= pusher.offsetHeight) {
            $(header).addClass('active');
            // $(sidebar).addClass('active');
            $(content).addClass('active');
        } else {
            $(header).removeClass('active');
            // $(sidebar).removeClass('active');
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
        this.spinnerTemplate = '<div class="spinnerDiv"><img src="./images/spinner.gif"></div>';

    }

    //===========================//
    //      Get Listings based   //
    //      on query input       //
    //      (or lack thereof)    //
    //===========================//

    EtsyClient.prototype.getListings = function(query, category, pricemin, pricemax) {

        var model = 'listings/';
        var filter = 'active';
        var self = this;
        var complete_api_URL = this.etsy_url + this.version + model + filter + ".js?limit=" + this.num_listings + "&min_price=" + pricemin + "&offset=" + this.offset + "&includes=MainImage";
        var mainURLEnd = "&api_key=" + this.api_key + "&callback=?";
        if (!!category) {
            var complete_api_URL = complete_api_URL + "&category=" + category;
        };
        if (!!pricemax) {
            var complete_api_URL = complete_api_URL + "&max_price=" + pricemax;
        };
        if (!!query) {
            var complete_api_URL = complete_api_URL + "&keywords=" + query;
        };
        var complete_api_URL = complete_api_URL + mainURLEnd;
        console.log(complete_api_URL);
        return $.getJSON(complete_api_URL);
    }


    EtsyClient.prototype.templateResults = function(url) {
        return $.get(url).then(function(my_template) {
            findVariables = _.template(my_template);
            return findVariables;
        });
    };

    EtsyClient.prototype.showListings = function(query, category, pricemin, pricemax) {
        var self = this;
        var all_Listings = '';
        $.when(
            this.templateResults(
                '../templates/ListingsResult.tmpl'),
            this.getListings(query, category, pricemin, pricemax)
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
                    if (oneListing.title.length >= 30) {
                        oneListing.short_title = (oneListing.title.substring(0, 30)) + '...';
                    } else if (oneListing.title.length < 30) {
                        oneListing.short_title = oneListing.title;
                    };
                    var filledHTML = template(oneListing);
                    all_Listings += filledHTML;
                });
            $('.listingsNav').fadeIn(400);
            $('.ListingsDestination')[0].innerHTML = all_Listings;
            if (results_amount === 0) {
                $('.results')[0].innerHTML = '<p>No results found for "' + query + '".<br>Please try another search.</p>';
            } else {
                $('.results')[0].innerText = 'Viewing ' + (self.offset + search_results.length) + ' results out of ' + results_amount;
            };
            $('.contentBlock').fadeIn(800);

        })
    }

    EtsyClient.prototype.getListingInfo = function(id) {
        //this is run when the user clicks on one of the listings. The listings change the PATH, which triggers the js to run this function with the id provided by the link (put in by showlistings)
        var model = 'listings';
        console.log(this.etsy_url + this.version + model + '/' + id + ".js?&includes=Images&api_key=" + this.api_key + "&callback=?");
        return $.getJSON(this.etsy_url + this.version + model + '/' + id + ".js?&includes=Images&api_key=" + this.api_key + "&callback=?");
    }

    EtsyClient.prototype.showUserInfo = function(id) {
        var p = $.Deferred();
        $.when(
            this.templateResults('../templates/sellerInfo.tmpl'),
            $.getJSON(this.etsy_url + this.version + "users/" + id + ".js?&api_key=" + this.api_key + "&callback=?"),
            $.getJSON(this.etsy_url + this.version + "users/" + id + "/profile.js?&api_key=" + this.api_key + "&callback=?")
        ).then(function(templateFn, userInfo, profile) {
            var sellerInfo = userInfo[0].results;
            var feedbackScore = sellerInfo[0].feedback_info.score;
            console.log(sellerInfo[0].feedback_info.score);
            var profileImage = profile[0].results[0].image_url_75x75;
            var FilledListing = templateFn(sellerInfo[0]);
            $('.sellerBox')[0].innerHTML = FilledListing;
            if (feedbackScore != null) {
                console.log('score test');
                // && feedbackScore <= 25) {
                //     $('.star1').toggleClass()
            } else(
                    function() {
                        $(".yesRating").toggle();
                        $(".noRating").toggle();
                    })
                //if score is null, toggle rating and notenoughinfo
                //if score is 1-25, toggle white/yellow on 1
        })
        return p;
    }

    EtsyClient.prototype.showListingInfo = function(id) {
        var self = this;
        var p = $.Deferred();
        $.when(
            this.templateResults('../templates/IndividualListing.tmpl'),
            this.getListingInfo(id)
        ).then(function(templateFn, listing) {
            console.log(listing[0]);
            var listingInfo = listing[0].results;
            var listingImageset = listing[0].results[0].Images;
            listingImages = [];
            listingImageset.forEach(
                function(imageObject) {
                    listingImages.push(imageObject.url_fullxfull + "")
                });

            //shortening the title, if necessary
            if (listingInfo[0].title.length >= 50) {
                listingInfo[0].short_title = (listingInfo[0].title.substring(0, 50)) + '...';
            } else if (listingInfo[0].title.length < 50) {
                listingInfo[0].short_title = listingInfo[0].title;
            };

            var FilledListing = templateFn(listingInfo[0]);
            $('.hoverListing')[0].innerHTML = FilledListing;
            $('.itemImages')[0].innerHTML = '<img src="' + listingImages[0] + '">';
            self.showUserInfo(listing[0].results[0].user_id);
            p.resolve();
        });
        return p;
    }

    EtsyClient.prototype.showRandomListing = function() {
        var self = this;
        var p = $.Deferred();
        if (typeof results_amount === 'undefined') {
            alert('Please wait for the page to fully load.')
        };
        var randomOffset = Math.floor(Math.random() * (results_amount - this.num_listings));
        var randomListingNumber = Math.floor(Math.random() * this.num_listings);
        var uriForRandomJSON = this.etsy_url + this.version + "listings/active" + ".js?limit=" + this.num_listings + "&min_price=100000&offset=" + randomOffset + "&includes=Images&api_key=" + this.api_key + "&callback=?";
        console.log(randomOffset + " out of " + results_amount);
        // $('.ListingsDestination')[0].innerHTML = '';

        $.when(
            this.templateResults('../templates/IndividualListing.tmpl'),
            $.getJSON(uriForRandomJSON)
        ).then(function(templateFn, listings) {
            var randomListing = listings[0].results[randomListingNumber];
            console.log(randomListing);
            var listingImageset = randomListing.Images;
            listingImages = [];
            listingImageset.forEach(
                function(imageObject) {
                    listingImages.push(imageObject.url_fullxfull + "")
                });

            //shortening the title, if necessary
            if (randomListing.title.length >= 50) {
                randomListing.short_title = (randomListing.title.substring(0, 50)) + '...';
            } else if (randomListing.title.length < 50) {
                randomListing.short_title = randomListing.title;
            };

            var FilledListing = templateFn(randomListing);
            $('.hoverListing')[0].innerHTML = FilledListing;
            $('.itemImages')[0].innerHTML = '<img src="' + listingImages[0] + '">';
            self.showUserInfo(randomListing.user_id);
            p.resolve();
        });
        return p;
    }

    EtsyClient.prototype.showClearance = function() {
        $('.ListingsDestination')[0].innerHTML = this.spinnerTemplate;
        this.showListings('', '', 10000, 10000);

    }

    EtsyClient.prototype.handleClickEvents = function() {



        //  Opening the modal
        var self = this;
        $('body').on('click', '.clickSurface', function() {
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
            if ($(".ListingsDestination") !== "" && $(".saleBanner").css('display') == "block") {
                console.log("already displaying clearance")
                return;
            } else {
                self.showClearance();
                setTimeout(function() {
                    //the following line is useful for showing timing of display:
                    // console.log($(".saleBanner").css('display'), ($(".saleBanner").css('display') == "none"));
                    if ($(".saleBanner").css('display') == "none") {
                        $(".saleBanner").toggle();
                        // css('display')) = "block";
                        // $(".saleBanner").toggle();

                    }
                }, 2500)

            }
        });


        //  Gallery Click
        $('body').on('click', '.gallery', function() {
            // first checks to see if Listings are shown, and if they're the clearance section
            if ($(".ListingsDestination") !== "" && $(".saleBanner").css('display') == "block") {
                $('.ListingsDestination')[0].innerHTML = self.spinnerTemplate;
                self.showListings('', '', 100000, '');
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
                self.showListings('', '', 100000, '');

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


        //  Category click

        $('.categories').on('click', 'li', function() {
            var category = $(this).attr('id');
            var query = '';
            var min_price = 100000;
            if (category === 'men') {
                var category = 'clothing';
                var query = 'mens';
                var min_price = 1000;
            } else if (category === 'women') {
                var category = 'clothing';
                var query = 'dress';
                var min_price = 10000;
            } else if (category === 'kids') {
                var category = 'clothing';
                var query = 'children';
                var min_price = 1000;
            };
            $('.ListingsDestination')[0].innerHTML = self.spinnerTemplate;
            self.showListings(query, category, min_price, '');

        });


        //  Search Queries - NavBar
        $('.navSearch').on('submit', function(e) {
            e.preventDefault();
            var searchQuery = ($(".sBox").val());
            // error-throwing for improper searches
            if (searchQuery === '' || searchQuery === '?' || searchQuery === '#') {
                console.log('please input a proper search query');
                return
            };
            $('.ListingsDestination')[0].innerHTML = self.spinnerTemplate;
            self.showListings(searchQuery, '', 10000, '');
            if ($(".priceSection").hasClass('ps_on_BG')) {
                console.log('test');
                $(".priceDisplay").toggle();
            }
        });


        //  Search Queries - Splash Page
        $('.topSearch').on('submit', function(e) {
            e.preventDefault();
            var searchQuery = ($(".topSBox").val());
            // error-throwing for improper searches
            if (searchQuery === '' || searchQuery === '?' || searchQuery === '#') {
                console.log('please input a proper search query');
                return
            };
            $('html, body').animate({
                scrollTop: $(".mainHeader").offset().top
            }, 700);
            $('.ListingsDestination')[0].innerHTML = self.spinnerTemplate;
            self.showListings(searchQuery, '', 10000, '');
            //3. test for errors using different search queries
        });

        //  Handling images left
        $('body').delegate('.imageDivLeft', 'click', function() {
            var currentImageURL = $('.itemImages')[0].innerHTML.replace('<img src="', '').replace('">', '');
            currentImage = listingImages.indexOf(currentImageURL) - 1;
            if (currentImage < 0) {
                currentImage = listingImages.length - 1;
            }
            $('.itemImages')[0].innerHTML = '<img src="' + listingImages[currentImage] + '">';


        });

        //  Handling images right
        $('body').delegate('.imageDivRight', 'click', function() {
            var currentImageURL = $('.itemImages')[0].innerHTML.replace('<img src="', '').replace('">', '');
            currentImage = listingImages.indexOf(currentImageURL) + 1;
            if (currentImage > listingImages.length - 1) {
                currentImage = 0;
            }
            $('.itemImages')[0].innerHTML = '<img src="' + listingImages[currentImage] + '">';
        });

        //  Displaying/Hiding prices
        $('body').on('click', '.priceButton', function() {
            $(".priceDisplay").toggle();
            $(".priceSection").toggleClass("ps_off_BG");
            $(".priceSection").toggleClass("ps_on_BG");
        });

        if ($(".priceSection").hasClass('ps_on_BG')) {
            $(".priceDisplay").toggle();
        }



        //Handling sorting box
        //involves:
        //$("select").change(function() {
        //     var selectedSorting = ($(this).val());
        //     console.log(selectedSorting);
        // });
    };

    var Affluentsy = new EtsyClient;
    Affluentsy.showListings('', '', 100000, '');
    Affluentsy.handleClickEvents();
}

//need routing prototype
//need history thingie
//need 'new Router'
//need create view (appends things to the dom)

window.onload = app;

Parse.initialize("2OeV2RO4epMFBZz5wcSLNrEQNqXbe76jUmJrAcIM", "PxkEISzj9UcYsbLSMLn3SeOnPsNaKkRg4v4TRRva");
