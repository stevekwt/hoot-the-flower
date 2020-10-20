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
		console.log(`sentLev is`, sentLev);
		// go into the positive zone, ie the 1st element of the moodKey array, and filter out all elements but the matching one
		const effectObject = hootApp.moodKey[1].filter(Obj=>{
			return Obj.sentLevel === sentLev;})
		console.log(effectObject[0].effect);
		return effectObject[0].effect	
	} else {
		console.log(`this number is less than zero`); // -0.06 * 10 = -0.6
		console.log(`sentLev is`, sentLev);
		// go into the negative zone, ie the 0th element of the moodKey array, and filter out all elements but the matching one
		const effectObject = hootApp.moodKey[0].filter(Obj=>{
			return Obj.sentLevel === sentLev ;})
		console.log(effectObject[0].effect);
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
	console.log(`pickedMovie is`, pickedMovie);
	// send user's movie title to OMDb and return its plot
	const OMDbPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.OMDbUrl}`,
				// method: 'GET',
				// dataType: 'json',
				params: {
					apikey: hootApp.OMDbApiKey,
					t: `${pickedMovie}`,
					plot: `full`,
				}
			}
	})
	return OMDbPromise;
}
// method that processes OMDb promise & displays data to page
// asdf ACTUALLY what it does is throws this data to Sentim
hootApp.displayOMDb = (movie) => {
	if (movie) {
		console.log("1. testing OMDb API");
		// store promise method in string
		const OMDbData = hootApp.OMDbDataPromise(movie);
		// if the promise is fulfilled, print out the data
		OMDbData.done((OMDbApiResponse) => {
			console.log(`2. The IMDB number is:`, OMDbApiResponse.imdbID);
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
	console.log(`4. plotString is`, plotString);
	const SentimPromise = $.ajax({
		url: hootApp.SentimUrl,
		method: 'POST',
		dataType: 'json',
		data: JSON.stringify({ text: `${plotString}` }),
		headers: {
			Accept: "application/json", 
			"Content-Type": "application/json"
		},
		success: function (data) {
			console.log('this has worked'); },
		error: function (data) {
			alert('this has not worked'); }
	})
	return SentimPromise;
};
// method that processes Sentim API promise & displays data to page
hootApp.displaySentim = (plot) => {
	console.log("3. testing sentim API; the plot is:", plot);
	// call the method that returns the API promise
	const sentimData = hootApp.sentimDataPromise(plot);
	// check whether the promise has resolved & log out the data from successful promise
	// if the promise is fulfilled, print out the data
	sentimData.done((sentimApiResponse) => {
		console.log(`sentimApiResponse is `, sentimApiResponse);
		$(".top-result-text").append(`
				<p> <span class="polarity"> Okay, so the emotional polarity of this movie is <span class="polarityNum">${sentimApiResponse.result.polarity}</span>.
					</span>
		`)
		console.log(`the emotional polarity of this movie is`, sentimApiResponse.result.polarity, `and the sentiment to send to the strain API is`, hootApp.sentToEffect(sentimApiResponse.result.polarity));
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
	console.log(`MovieEffect is`, MovieEffect);
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
	console.log(`MovEffect is`, MovEffect);
	const strainData = hootApp.strainDataPromise(MovEffect);
	// check whether the promise has resolved & log out the data from successful promise
	console.log("testing strains API");
	// if the promise is fulfilled, print out the data
	strainData.done((strainApiResponse) => {
		// log all responses
		console.log(strainApiResponse);
		// choose 1 randomly
		strainToPrint = hootApp.randomElement(strainApiResponse);
		console.log(`strainToPrint is`, strainToPrint);
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
		console.log(`URL/strainWithDashes is https://www.leafly.com/search?q=${strainWithDashes}`);
		strainSearchURL = `https://www.leafly.com/search?q=${strainWithDashes}`;
	})
}
// ==== END first STRAIN API call ============



// 44444444 ==== START second STRAIN API call to get the full list of effects associated with the chosen strain ============
hootApp.strainEffectsDataPromise = (strainID) => {
	console.log(`we are inside strainEffectsDataPromise & strainID is`, strainID);
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
	console.log(`we are inside displayStrainsEffects & strainInDisplay is`, strainInDisplay);
	const strainData = hootApp.strainEffectsDataPromise(strainInDisplay);
	// check whether the promise has resolved & log out the data from successful promise
	console.log("testing strainsEffect API");
	// if the promise is fulfilled, print out the data
	strainData.done((strainEffectsApiResponse) => {
		// log all responses
		console.log(`positive effects are ${strainEffectsApiResponse.positive}`);
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
		// log all responses
		console.log(`negative effects are ${strainEffectsApiResponse.negative}`);
		// display all the negative effects slowly
		const negativeEffects = strainEffectsApiResponse.negative;
		console.log(`negativeEffects.length is`, negativeEffects.length)
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
	console.log(`strain is`, strain);
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
	console.log(`we are inside displayStrainsDesc aaaaaaaaaaand strainInDisplay is`, strainInDisplay);
	const strainData = hootApp.strainDescDataPromise(strainInDisplay);
	// check whether the promise has resolved & log out the data from successful promise
	console.log("testing strainsEffect API");
	// if the promise is fulfilled, print out the data
	strainData.done((strainDescriptionApiResponse) => {
		// log all responses
		descItself = strainDescriptionApiResponse[0].desc;
		console.log(`descItself is`, descItself);
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
	console.log(`Movie is`, Movie);
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
	console.log(`Mov is`, Mov);
	const theMovData = hootApp.theMovDataPromise(Mov);
// 	check whether the promise has resolved & log out the data from successful promise
	console.log("testing whether we're inside The Movie DB API display function, and theMovData is");
// 	if the promise is fulfilled, print out the data
	theMovData.done((theMovApiResponse) => {
// 		log all responses
		console.log(`${hootApp.TMDbImageBaseUrl}/${hootApp.TMDBImageSize}/${theMovApiResponse.poster_path}`);
// 		store in variable
		const newBG = `${hootApp.TMDbImageBaseUrl}/${hootApp.TMDBImageSize}/${theMovApiResponse.poster_path}`;
// 		& print it
		// $("body").css("background-image", `url(${newBG})`);
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
		console.log(`userMovie is`, userMovie);  
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
    console.log("DOM is loaded");
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

				// params: {
				// 	dataType: 'json',
				// 	method: 'GET',
					
			// 	}
			// }
	});
	return theMovieIMAGEBASEURLPromise;
};
// method that processes The Movie DB API promise & displays data to page
hootApp.displayIMAGEBASEURLTheMovie = () => {
// 	call the method that returns the API promise
	const theMovIMAGEBASEURLData = hootApp.theMovIMAGEBASEURLDataPromise();
// 	check whether the promise has resolved & log out the data from successful promise
	console.log("inside The theMovIMAGEBASEURLData API, theMovIMAGEBASEURLData is", theMovIMAGEBASEURLData);
// 	if the promise is fulfilled, print out the data
	theMovIMAGEBASEURLData.done((theMovApiIMAGEBASEURLResponse) => {
// 		log all responses
		console.log(theMovApiIMAGEBASEURLResponse.images.base_url, theMovApiIMAGEBASEURLResponse.images.backdrop_sizes[2]);
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
	console.log(`pickedMovie is`, pickedMovieforShortPlot);
	// send user's movie title to OMDb and return its plot
	const OMDbShortPlotPromise = $.ajax({
		url: 'https://proxy.hackeryou.com',
			dataType: 'json',
			method:'GET',
			data: {
				reqUrl: `${hootApp.OMDbUrl}`,
				// method: 'GET',
				// dataType: 'json',
				params: {
					apikey: hootApp.OMDbApiKey,
					t: `${pickedMovieforShortPlot}`,
				}
			}
	})
	return OMDbShortPlotPromise;
}
// method that processes OMDb promise & displays data to page
// asdf ACTUALLY what it does is throws this data to Sentim
hootApp.displayShortPlotOMDb = (movie) => {
	if (movie) {
		console.log("1. testing OMDb API");
		// store promise method in string
		const OMDbShortPlotData = hootApp.OMDbShortPlotDataPromise(movie);
		// if the promise is fulfilled, print out the data
		OMDbShortPlotData.done((OMDbApiShortPlotResponse) => {
			console.log(`2. The IMDB number is:`, OMDbApiShortPlotResponse.imdbID);
			ShortPlot = OMDbApiShortPlotResponse.Plot;
			$(".plot-box").append(`
				<p> Right, yeah, that one. ${ShortPlot}					
			`)
		})
	}
}
// ==== END MOVIE API ============

