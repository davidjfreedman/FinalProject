function app() {

    //===========================//
    //      Make NavBar fixed    //
    //        on scroll          //
    //===========================//

    $(window).on('scroll', function() {
        if (window.scrollY >= $('.verticalPusher')[0].offsetHeight) {
            $('.mainheader').addClass('active');
            // $(sidebar).addClass('active');
            $('.contentBlock').addClass('active');
        } else {
            $('.mainheader').removeClass('active');
            // $(sidebar).removeClass('active');
            $('.contentBlock').removeClass('active');
        }
        if (window.scrollY >= $('.verticalPusher')[0].offsetHeight + 50) {
            $('.scrollToTop').addClass('active');
        } else {
            $('.scrollToTop').removeClass('active');
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
        this.sort_on = 'created';
        this.sort_order = 'down';
        this.query = '';
        this.category = '';
        this.minPrice = '';
        this.maxPrice = '';
        this.num_listings = 20;
        this.spinnerTemplate = '<div class="spinnerDiv"><img src="./images/spinner.gif"></div>';

    }

    //===========================//
    //       Getting it to       //
    //      scroll to the top    //
    //   of the listing results  //
    //===========================//

    EtsyClient.prototype.scrollToTop = function() {
        var scrollToHere = $('.verticalPusher').height();
        $("html, body").animate({
            scrollTop: scrollToHere
        }, 625);
    }

    EtsyClient.prototype.addSpinner = function() {
        $('.ListingsDestination')[0].innerHTML = '<div class="spinnerDiv"><img src="./images/spinner.gif"></div>';
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
        var complete_api_URL = this.etsy_url + this.version + model + filter + ".js?limit=" + this.num_listings + "&min_price=" + pricemin + "&offset=" + this.offset + "&sort_on=" + this.sort_on + "&sort_order=" + this.sort_order + "&includes=MainImage";
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
            if (query === '' && category === '' && pricemin === 100000 && pricemax === '') {
                normal_results_amount = listings[0].count;
            };
            var results_amount = listings[0].count;
            var search_results = listings[0].results;
            search_results = _.filter(search_results, function(listing) {
                return (listing.state === "active");
            })
            //use the following line if there's a state issue:
            // console.log(oneListing.state)
            search_results.forEach(
                function(oneListing) {
                    //checking if we're in clearance section, and adding banner
                    if ($(".clearance").hasClass('active')) {
                        oneListing.sBannerState = ('saleBannerOn');
                    } else {
                        oneListing.sBannerState = ('saleBannerOff')
                    };
                    //checking if prices are supposed to be showing
                    if ($(".priceSection").hasClass('ps_off_BG')) {
                        oneListing.pButtonState = ('priceDisplayOff');
                    } else {
                        oneListing.pButtonState = ('priceDisplayOn');
                    };
                    //checks length of listing title, shortens if necessary
                    if (oneListing.title.length >= 30) {
                        oneListing.short_title = (oneListing.title.substring(0, 30)) + '...';
                    } else if (oneListing.title.length < 30) {
                        oneListing.short_title = oneListing.title;
                    };
                    var filledHTML = template(oneListing);
                    all_Listings += filledHTML;
                });
            $('.clearance').removeClass('active')
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
        $('.randomSpinnerSegment').addClass('active');
        var p = $.Deferred();
        if (typeof normal_results_amount === 'undefined') {
            alert('Please wait for the page to fully load.')
        };
        var randomOffset = Math.floor(Math.random() * (normal_results_amount - this.num_listings));
        var randomListingNumber = Math.floor(Math.random() * this.num_listings);
        var uriForRandomJSON = this.etsy_url + this.version + "listings/active" + ".js?limit=" + this.num_listings + "&min_price=100000&offset=" + randomOffset + "&includes=Images&api_key=" + this.api_key + "&callback=?";
        console.log(randomOffset + " out of " + normal_results_amount);
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
            $('.randomSpinnerSegment').removeClass('active');
        });
        return p;
    }

    EtsyClient.prototype.showClearance = function() {
        this.scrollToTop();
        this.addSpinner();
        $(".clearance").addClass('active');
        this.showListings('', '', 10000, 100000);

    }

    EtsyClient.prototype.handleClickEvents = function() {

        var menuButtonClickTest = function() {
            if ($(".menuButton").hasClass('active')) {
                $(".menuButton").toggleClass('active');
                $(".menuDroppedDown").toggleClass('active');
            };
        };

        //  Opening the modal
        var self = this;
        $('body').on('click', '.clickSurface', function() {
            var targetID = event.target.id;
            $.when(
                self.showListingInfo(targetID)
            ).then(function() {
                $('body').toggleClass('noScroll');
                $('#individualListing').toggleClass('individualListingOff');
            });
        });

        //  Disclaimer click
        $('body').on('click', '.disclaimerButton', function() {
            $('.disclaimer').toggleClass('active');
            if ($('.disclaimer').hasClass('active')) {
                console.log('up', $('.disclaimerButton')[0].innerHTML);
                $('.disclaimerButton')[0].innerHTML = '<i class="fa fa-caret-down"></i>';
            } else {
                console.log('down');
                $('.disclaimerButton')[0].innerHTML = '<i class="fa fa-caret-up"></i>';
            }
        });

        //  Closing the modal
        $('body').on('click', '#listingMask', function() {
            $('body').toggleClass('noScroll');
            $('#individualListing').toggleClass('individualListingOff');
        });
        $('body').on('click', '.closeButton', function() {
            $('body').toggleClass('noScroll');
            $('#individualListing').toggleClass('individualListingOff');
        });

        //  Clearance Section Click
        $('body').on('click', '.clearance', function() {
            menuButtonClickTest();
            if ($(".ListingsDestination") !== "" && $('.saleBannerLocation').hasClass('saleBannerOn')) {
                self.scrollToTop();
                console.log("already displaying clearance")
                return;
            } else {
                self.showClearance();
            }
        });


        //  Gallery Click
        $('body').on('click', '.gallery', function() {
            // first checks if the user clicked on the drop down button
            menuButtonClickTest();
            // first checks to see if Listings are shown, and if they're in the clearance or category sections
            if ($(".ListingsDestination") !== "" && ($('.saleBannerLocation').hasClass('saleBannerOn') || self.category !== '')) {
                self.scrollToTop();
                self.addSpinner();
                self.category = '';
                self.showListings('', '', 100000, '');
            }

            // next checks if Listings are there and already displaying gallery listings
            else if ($(".ListingsDestination") !== "" && $('.saleBannerLocation').hasClass('saleBannerOff') && self.category === '') {
                //this section will eventually be changed when the categories are working
                console.log(self.category, "already displaying gallery");
                return;
            }

            // lastly, checks if Listings are not there
            else if ($(".ListingsDestination")[0].innerHTML === "") {
                self.showListings('', '', 100000, '');

            }
        });


        //  Random Listing Click
        $('body').on('click', '.random', function() {
            $.when(
                self.showRandomListing()
            ).then(function() {
                $('body').toggleClass('noScroll');
                $('#individualListing').toggleClass('individualListingOff');
            });
        });


        //  Category click

        $('.categories').on('click', 'li', function() {
            self.category = $(this).attr('id');
            self.query = '';
            self.minPrice = 100000;
            _query = self.query;
            _category = self.category;
            _minPrice = self.minPrice;
            self.maxPrice = '';
            if (_category === 'men') {
                _category = 'clothing';
                _query = 'mens';
                _minPrice = 1000;
            } else if (_category === 'women') {
                _category = 'clothing';
                _query = 'dress';
                _minPrice = 10000;
            } else if (_category === 'kids') {
                _category = 'clothing';
                _query = 'children';
                _minPrice = 1000;
            };
            self.query = _query;
            self.category = _category;
            self.minPrice = _minPrice;
            self.scrollToTop();
            self.addSpinner();
            self.showListings(self.query, self.category, self.minPrice, self.maxPrice)
        });

        //  Drop-Down Nav Menu
        var menuButton = document.querySelector('.menuButton');
        var droppedMenu = document.querySelector('.menuDroppedDown');
        $('body').on('click', '.menuButton', function() {
            $(menuButton).toggleClass('active');
            $(droppedMenu).toggleClass('active');
        });
        $(window).resize(function() {
            if ($('.mainHeader').width() >= 585) {
                $(menuButton).removeClass('active');
                $(droppedMenu).removeClass('active');
            }
        });

        //  Scroll to Top button click
        $('body').on('click', '.scrollToTop', (function() {
            var scrollToHere = $('.verticalPusher').height();
            $("html, body").animate({
                scrollTop: scrollToHere
            }, 750);
        }));

        //  Search Queries - NavBar
        $('.navSearch').on('submit', function(e) {
            e.preventDefault();
            //if we add search inside category/clearance, simply do an if check on whether the box is checked, and incorporate the following changes into the else statement:
            self.category = '';
            self.minPrice = 10000;
            self.maxPrice = '';
            var searchQuery = ($(".sBox").val());
            // error-throwing for improper searches
            if (searchQuery === '' || searchQuery === '?' || searchQuery === '#') {
                console.log('please input a proper search query');
                return
            };
            self.scrollToTop();
            self.addSpinner();
            self.query = searchQuery;
            // self.showListings(searchQuery, '', 10000, '');
            self.showListings(self.query, self.category, self.minPrice, self.maxPrice)
            if ($(".priceSection").hasClass('ps_on_BG')) {
                console.log('test');
                $(".priceDisplay").toggle();
            }
        });


        //  Search Queries - Splash Page
        $('.topSearch').on('submit', function(e) {
            e.preventDefault();
            //if we add search inside category/clearance, simply do an if check on whether the box is checked, and incorporate the following changes into the else statement:
            self.category = '';
            self.minPrice = 10000;
            self.maxPrice = '';
            var searchQuery = ($(".topSBox").val());
            // error-throwing for improper searches
            if (searchQuery === '' || searchQuery === '?' || searchQuery === '#') {
                console.log('please input a proper search query');
                return
            };
            self.scrollToTop();
            self.addSpinner();
            self.query = searchQuery;
            // self.showListings(searchQuery, '', 10000, '');
            self.showListings(self.query, self.category, self.minPrice, self.maxPrice)
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
            var priceButtonToggle = function() {
                $(".priceSection").toggleClass("ps_off_BG");
                $(".priceSection").toggleClass("ps_on_BG");
            }
            if ($(".priceSection").hasClass('ps_off_BG')) {
                $(".PriceButton")[0].innerText = "Hide Prices";
                $(".priceDiv").removeClass('priceDisplayOff');
                $(".priceDiv").addClass('priceDisplayOn');
                priceButtonToggle();
            } else {
                $(".PriceButton")[0].innerText = "Show Prices";
                priceButtonToggle();
                $(".priceDiv").removeClass('priceDisplayOn');
                $(".priceDiv").addClass('priceDisplayOff');
            };
        });


        //Handling sorting box

        $("select").change(function() {
            var selectedSorting = ($("select").val());
            self.scrollToTop();
            self.addSpinner();
            var sort_on = self.sort_on;
            if (selectedSorting === '$ascend') {
                sort_on = "price";
                sort_order = "up";
            } else if (selectedSorting === '$descend') {
                sort_on = "price";
                sort_order = "down";
            } else if (selectedSorting === 'newest') {
                sort_on = "created";
                sort_order = "down";
            } else if (selectedSorting === 'oldest') {
                sort_on = "created";
                sort_order = "up";
            };
            self.sort_on = sort_on;
            self.sort_order = sort_order;
            console.log(self.sort_on, self.sort_order);
            // self.showListings('', '', 100000, '');
            self.showListings(self.query, self.category, self.minPrice, self.maxPrice)
        });
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
