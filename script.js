// namespace object for app
const hootApp = {};
let userMovie;
let chosenStrain;
let chosenStrainID;
let strainSearchURL;
let moviePlot;

// docs: http://strains.evanbusse.com/index.html
hootApp.strainApiKey = `vXNUjkU`;
hootApp.strainUrl = `http://strainapi.evanbusse.com/${hootApp.strainApiKey}`;
// docs: http://www.omdbapi.com/
hootApp.OMDbApiKey = `4ca6ea8d`;
hootApp.OMDbUrl = `http://www.omdbapi.com/`;
// docs: https://sentim-api.herokuapp.com/
hootApp.SentimUrl = `https://sentim-api.herokuapp.com/api/v1/`;

// docs for movies: https://developers.themoviedb.org/3/movies/get-movie-details
// docs for posters: https://developers.themoviedb.org/3/configuration/get-api-configuration
hootApp.TMDbApiKey = `08901c03be961b6bc69056fe9bd41916`;
hootApp.TMDbUrl = `https://api.themoviedb.org/3/movie`;
hootApp.TMDbConfigUrl = `https://api.themoviedb.org/3`;
hootApp.TMDbImageBaseUrl = `https://image.tmdb.org/t/p`;
hootApp.TMDbImageBaseAPIUrl = `https://api.themoviedb.org/3/configuration`;
hootApp.TMDBImageSize = `w1280`;

hootApp.moodKey = [
	[
		{
			effect: 'Sleepy',
			sentLevel: -1
		},
		{
			effect: 'Hungry',
			sentLevel: -2
		},
		{
			effect: 'Dry eyes',
			sentLevel: -3
		},
		{
			effect: 'Dry mouth',
			sentLevel: -4
		},
		{
			effect: 'Dizzy',
			sentLevel: -5
		},
		{
			effect: 'Anxious',
			sentLevel: -6
		},
		{
			effect: 'Paranoid',
			sentLevel: -7
		}
	],
	[
		{
			effect: 'Relaxed',
			sentLevel: 0
		},
		{
			effect: 'Focused',
			sentLevel: 1
		},
		{
			effect: 'Talkative',
			sentLevel: 2
		},
		{
			effect: 'Aroused',
			sentLevel: 3
		},
		{
			effect: 'Creative',
			sentLevel: 4
		},
		{
			effect: 'Happy',
			sentLevel: 5
		},
		{
			effect: 'Tingly',
			sentLevel: 6
		},
		{
			effect: 'Uplifted',
			sentLevel: 7
		},
		{
			effect: 'Giggly',
			sentLevel: 8
		},
		{
			effect: 'Energetic',
			sentLevel: 9
		},
		{
			effect: 'Euphoric',
			sentLevel: 10
		},
	]
];

// translate effect number to sentiment word
// based on the above data 
hootApp.sentToEffect = (senti) => {				// 0.25
	// if the sentiment is 0 or above,			// 0.25
	const sentLev = Math.ceil(senti * 10); // returns 3
	if (sentLev >= 0) {
		// go into the positive zone, ie the 1st element of the moodKey array, and filter out all elements but the matching one
		const effectObject = hootApp.moodKey[1].filter(Obj=>{
			return Obj.sentLevel === sentLev;})
		return effectObject[0].effect	
	} else {
		// go into the negative zone, ie the 0th element of the moodKey array, and filter out all elements but the matching one
		const effectObject = hootApp.moodKey[0].filter(Obj=>{
			return Obj.sentLevel === sentLev ;})
		return effectObject[0].effect	
	}
};

// choose random element from an array 
// (which needs to be done twice due to the structure of returned Strains data, if "length" is > 100)
hootApp.randomElement = function(array) {
	const index = Math.floor(Math.random() * array.length);
	return array[index];
};

// 1111111111 ==== START MOVIE API ============
// API call to OMDb 
// store the promise in a variable
// store that variable in a method
hootApp.OMDbDataPromise = (pickedMovie) => {
	// send user's movie title to OMDb and return its plot
	const OMDbPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.OMDbUrl}`,
				params: {
					apikey: hootApp.OMDbApiKey,
					t: `${pickedMovie}`,
					plot: `full`,
				}
			}
	})
	return OMDbPromise;
}
// throws this data to Sentim
hootApp.displayOMDb = (movie) => {
	if (movie) {
		// store promise method in string
		const OMDbData = hootApp.OMDbDataPromise(movie);
		// if the promise is fulfilled, print out the data
		OMDbData.done((OMDbApiResponse) => {
			moviePlot = OMDbApiResponse.Plot;
			hootApp.displaySentim(moviePlot); 
			hootApp.displayTheMovie(OMDbApiResponse.imdbID);
		})
	}
}
// ==== END MOVIE API ============

// 222222222 ==== START SENTIM API ============
// API call to Sentim 
// store the promise in a variable
// store that variable in a method
hootApp.sentimDataPromise = (plotString) => {
	const SentimPromise = $.ajax({
		url: hootApp.SentimUrl,
		method: 'POST',
		dataType: 'json',
		data: JSON.stringify({ text: `${plotString}` }),
		headers: {
			Accept: "application/json", 
			"Content-Type": "application/json"
		},
		success: function (data) { },
		error: function (data) {
			alert(`This sentiment analysis didn't come back; the API might be down`); }
	})
	return SentimPromise;
};
// method that processes Sentim API promise & displays data to page
hootApp.displaySentim = (plot) => {
	// call the method that returns the API promise
	const sentimData = hootApp.sentimDataPromise(plot);
	// check whether the promise has resolved & log out the data from successful promise
	// if the promise is fulfilled, print out the data
	sentimData.done((sentimApiResponse) => {
		$(".top-result-text").append(`
				<p> <span class="polarity"> Okay, so the emotional polarity of this movie is <span class="polarityNum">${sentimApiResponse.result.polarity}</span>.
					</span>
		`)
		const effecForDisplay = hootApp.sentToEffect(sentimApiResponse.result.polarity).toLowerCase();
		// translate the polarity to effect & send the effect to the strain API
		const effectForStrainAPI = hootApp.sentToEffect(sentimApiResponse.result.polarity);
		hootApp.displayStrains(effectForStrainAPI);
	})
}

// ==== END SENTIM API ============



// 333333333 ==== START first STRAIN API call ============
// API call to Strain API
// store the promise returned within a variable
// store that variable within a method 
hootApp.strainDataPromise = (MovieEffect) => {
	const strainPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.strainUrl}/strains/search/effect/${MovieEffect}`,
				params: {
					dataType: 'json',
					method: 'GET'
				}
			}
	});
	return strainPromise;
};

// method that processes Strain API promise & displays data to page
hootApp.displayStrains = (MovEffect) => {
	// call the method that returns the API promise
	const strainData = hootApp.strainDataPromise(MovEffect);
	// check whether the promise has resolved & log out the data from successful promise
	// if the promise is fulfilled, print out the data
	strainData.done((strainApiResponse) => {
		// choose 1 randomly
		strainToPrint = hootApp.randomElement(strainApiResponse);
		chosenStrain = strainToPrint.name;
		chosenStrainID = strainToPrint.id;
		// send this strain back to the Strain API to get all its effects
		hootApp.displayStrainsEffects(chosenStrainID);
		// send this strain back to the Strain API to get its description 
		hootApp.displayStrainsDesc(chosenStrain)
		// & print it... in theory, after all the effects are printed out first (which we could also do by simply printing the strain name out in the 2nd strain function, because the strain name is a global variable)
		setTimeout(function(){
			$(".bottom-result-text").append(`
				<h4>${chosenStrain} ${strainToPrint.race}
				</h4> `)
			$(".strain-box").append(`
				<p> For which, like, there miiight be a way to get it <a href="${strainSearchURL}"><i class="fas fa-cannabis"></i>here<i class="fas fa-cannabis"></i></a>? </p>
			`)
		}, 4000);
		// make a URL for Leafly
		const strainWithDashes = strainToPrint.name.replace(/\s+/g, "-");
		strainSearchURL = `https://www.leafly.com/search?q=${strainWithDashes}`;
	})
}
// ==== END first STRAIN API call ============

// 44444444 ==== START second STRAIN API call to get the full list of effects associated with the chosen strain ============
hootApp.strainEffectsDataPromise = (strainID) => {
	const strainIDEffectsPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.strainUrl}/strains/data/effects/${strainID}`,
				params: {
					dataType: 'json',
					method: 'GET'
				}
			}
	});
	return strainIDEffectsPromise;
};

// method that processes Strain API promise & displays data to page
hootApp.displayStrainsEffects = (strainInDisplay) => {
	// call the method that returns the API promise
	const strainData = hootApp.strainEffectsDataPromise(strainInDisplay);
	// check whether the promise has resolved & log out the data from successful promise
	// if the promise is fulfilled, print out the data
	strainData.done((strainEffectsApiResponse) => {
		// display all the positive effects slowly
		const positiveEffects = strainEffectsApiResponse.positive;
		// & print it    	
		let counterPositive = 0;
		setTimeout(function(){
			$(".top-result-text").append(`
						<p><span class="positive">And, tasty, it's:</span>
						<ul>
			`)	
		}, 100);
		for (const property in positiveEffects) {
			setTimeout(function(){
				lowerPositive = positiveEffects[property].toLowerCase();
				$(".top-result-text").append(`
					<li>${lowerPositive}...</li>
				`)
			}, (400 + counterPositive) );
			counterPositive += 300;
		}
		// display all the negative effects slowly
		const negativeEffects = strainEffectsApiResponse.negative;
		// & print it    	
		let counternegative = 0;
		if (negativeEffects.length > 0) {
			setTimeout(function(){
				$(".top-result-text").append(`
					</ul>
					<p>
							<span class="negative">But, harsh tokes, the movie also seems kinda:
							</span>
					<ul>
				`)		
			}, 1500);
			for (const property in negativeEffects) {
				setTimeout(function(){
					lowernegative = negativeEffects[property].toLowerCase();
					$(".top-result-text").append(`
							<li><span class="negative">'${lowernegative}'...
							</span></li>
					`)
				}, (2000 + counternegative) );
				counternegative += 400;
			}
		};
		setTimeout(function(){
			$(".top-result-text").append(`
			</ul>
			<p>
						<span class="negative">So... to be honest, what I'm gonna recommend for you is:
						</span>
				</p>
			`)		
		}, 3500);
	})
}
// ==== END second STRAIN API call ============

// 555555 ==== START 3rd STRAIN API call to get the strain's description =====
hootApp.strainDescDataPromise = (strain) => {
	const strainEffectsPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.strainUrl}/strains/search/name/${strain}`,
				params: {
					dataType: 'json',
					method: 'GET'
				}
			}
	});
	return strainEffectsPromise;
};

// method that processes Strain API promise & displays data to page
hootApp.displayStrainsDesc = (strainInDisplay) => {
	// call the method that returns the API promise
	const strainData = hootApp.strainDescDataPromise(strainInDisplay);
	// check whether the promise has resolved & log out the data from successful promise
	// if the promise is fulfilled, print out the data
	strainData.done((strainDescriptionApiResponse) => {
		// log all responses
		descItself = strainDescriptionApiResponse[0].desc;
		if (descItself) {
			setTimeout(function(){
				$(".strain-box").append(`
						<span class="desc"> And bud, the thing about this strain is?
						</span>
					`)
			}, 4500);
			// display description
			setTimeout(function(){
				$(".strain-box").append(`
					<h5 class="desc"> ${descItself}
					</h5>
				`)
			}, 5000);
		};
	})
}
// ==== END 3rd STRAIN API call ============

// 555555555 ==== START THE MOVIE DB API CALL for poster images ============
// API call to THE MOVIE DB 
// store the promise returned within a variable
// store that variable within a method 
hootApp.theMovDataPromise = (Movie) => {
	const theMoviePromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.TMDbUrl}/${Movie}`,
				params: {
					dataType: 'json',
					method: 'GET',
					api_key: hootApp.TMDbApiKey,
				}
			}
	});
	return theMoviePromise;
};

// method that processes The Movie DB API promise & displays data to page
hootApp.displayTheMovie = (Mov) => {
// 	call the method that returns the API promise
	const theMovData = hootApp.theMovDataPromise(Mov);
// 	check whether the promise has resolved & log out the data from successful promise
// 	if the promise is fulfilled, print out the data
	theMovData.done((theMovApiResponse) => {
// 		store in variable
		const newBG = `${hootApp.TMDbImageBaseUrl}/${hootApp.TMDBImageSize}/${theMovApiResponse.poster_path}`;
// 		& print it
		setTimeout(function(){
			$(".poster-img").append(`
				<img src="${newBG}" class="center-img">
			`)
		}, 250);
	})
}
// ==== END THE MOVIE DB API CALL ============

// ======= START EVENT LISTENER FOR FORM =========
    // create an event listener on the form
    $('form').on('submit', function(e) {
		// prevent refresh 
		e.preventDefault();
		$(".top-result-text").empty();
		$(".bottom-result-text").empty();
		$(".poster-img").empty();
		$(".strain-box").empty();
		$(".plot-box").empty();
		// put value from text input into a variable
		const userMovie = $('#movie').val();
		hootApp.displayOMDb(userMovie);
		hootApp.displayShortPlotOMDb(userMovie);
	})
// ======= END EVENT LISTENER FOR FORM =========

// ==== START INIT ============
// init
hootApp.init = () => {
	hootApp.displayIMAGEBASEURLTheMovie();
};

// doc ready
$(function() {
    hootApp.init();
});

////  66666 API CALL TO CONFIRM BASE URL FOR IMAGES WHICH APPARENTLY CHANGES SOMETIMES 
hootApp.theMovIMAGEBASEURLDataPromise = () => {
	const theMovieIMAGEBASEURLPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.TMDbImageBaseAPIUrl}`,

				params: {
					api_key: hootApp.TMDbApiKey,
				  },
				  proxyHeaders: {
					'Some-Header': 'goes here'
				  },
			xmlToJSON: false,
			useCache: false
			}
	});
	return theMovieIMAGEBASEURLPromise;
};
// method that processes The Movie DB API promise & displays data to page
hootApp.displayIMAGEBASEURLTheMovie = () => {
// 	call the method that returns the API promise
	const theMovIMAGEBASEURLData = hootApp.theMovIMAGEBASEURLDataPromise();
// 	check whether the promise has resolved & log out the data from successful promise
// 	if the promise is fulfilled, print out the data
	theMovIMAGEBASEURLData.done((theMovApiIMAGEBASEURLResponse) => {
// 		& store them
		hootApp.TMDbImageBaseUrl = theMovApiIMAGEBASEURLResponse.images.base_url;
		hootApp.TMDBImageSize = theMovApiIMAGEBASEURLResponse.images.backdrop_sizes[0];
		// above, the 3 in the array is selecting "original" in the API's image-size array, as follows:
		// "backdrop_sizes": [
		// 	"w300",		ie 0
		// 	"w780",		ie 1
		// 	"w1280",	ie 2
		// 	"original"	ie 3
		//   ],
	})
}

// 7777777 ==== START MOVIE API call for short plot ============
hootApp.OMDbShortPlotDataPromise = (pickedMovieforShortPlot) => {
	// send user's movie title to OMDb and return its plot
	const OMDbShortPlotPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.OMDbUrl}`,
				params: {
					apikey: hootApp.OMDbApiKey,
					t: `${pickedMovieforShortPlot}`,
				}
			}
	})
	return OMDbShortPlotPromise;
}
// throws this data to Sentim
hootApp.displayShortPlotOMDb = (movie) => {
	if (movie) {
		// store promise method in string
		const OMDbShortPlotData = hootApp.OMDbShortPlotDataPromise(movie);
		// if the promise is fulfilled, print out the data
		OMDbShortPlotData.done((OMDbApiShortPlotResponse) => {
			ShortPlot = OMDbApiShortPlotResponse.Plot;
			$(".plot-box").append(`
				<p> Right, yeah, that one. ${ShortPlot}					
			`)
		})
	}
}
// ==== END MOVIE API ============