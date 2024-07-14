document.addEventListener("DOMContentLoaded", function() {
    const latit = document.getElementById("lati");
    const longit = document.getElementById("longi");
    const timezone = document.getElementById("timezone");
    const offsetStd = document.getElementById("offset-std");
    const offsetStdSeconds = document.getElementById("offset-std-seconds");
    const offsetDst = document.getElementById("offset-dst");
    const offsetDstSeconds = document.getElementById("offset-dst-seconds");
    const country = document.getElementById("country");
    const postcode = document.getElementById("postcode");
    const city = document.getElementById("city");

    const addressInput = document.getElementById("address-input");
    const submitBtn = document.getElementById("submit-btn");
    const errorMsg = document.getElementById("error-msg");

    errorMsg.style.display = "none";

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            latit.innerHTML = "Geolocation is not supported by this browser.";
            longit.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        latit.innerText = `Lat: ${latitude}`;
        longit.innerText = `Long: ${longitude}`;

        fetchTimeZone(latitude, longitude, "initial");
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                latit.innerHTML = "User denied the request for Geolocation.";
                longit.innerHTML = "";
                break;
            case error.POSITION_UNAVAILABLE:
                latit.innerHTML = "Location information is unavailable.";
                longit.innerHTML = "";
                break;
            case error.TIMEOUT:
                latit.innerHTML = "The request to get user location timed out.";
                longit.innerHTML = "";
                break;
            case error.UNKNOWN_ERROR:
                latit.innerHTML = "An unknown error occurred.";
                longit.innerHTML = "";
                break;
        }
    }

    
    function fetchTimeZone(lat, lon, type = "initial") {
        const apiKey = 'bc70ae63ee5f4c75969f7a022e255011';
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.features && data.features.length > 0) {
                    const timezoneData = data.features[0].properties.timezone;
                    const locationData = data.features[0].properties;

                    if (timezoneData) {
                        if (type === "initial") {
                            timezone.innerText = "TimeZone:  "+timezoneData.name;
                            offsetStd.innerText = "Offset STD:  "+timezoneData.offset_STD;
                            offsetStdSeconds.innerText = "Offset STD Seconds:  "+timezoneData.offset_STD_seconds;
                            offsetDst.innerText = "Offset DST:  "+timezoneData.offset_DST;
                            offsetDstSeconds.innerText = "Offset DST Seconds:  "+timezoneData.offset_DST_seconds;
                            country.innerText = "Country:  "+locationData.country;
                            postcode.innerText = "Postcode:  "+locationData.postcode;
                            city.innerText = "City:  "+locationData.city;
                        } else {
                            document.getElementById("timezone-result").innerText = timezoneData.name;
                            document.getElementById("offset-std-result").innerText = timezoneData.offset_STD;
                            document.getElementById("offset-std-seconds-result").innerText = timezoneData.offset_STD_seconds;
                            document.getElementById("offset-dst-result").innerText = timezoneData.offset_DST;
                            document.getElementById("offset-dst-seconds-result").innerText = timezoneData.offset_DST_seconds;
                            document.getElementById("country-result").innerText = locationData.country;
                            document.getElementById("postcode-result").innerText = locationData.postcode;
                            document.getElementById("city-result").innerText = locationData.city;
                        }
                    } else {
                        displayNoTimezoneDataError(type);
                    }
                } else {
                    displayNoTimezoneDataError(type);
                }
            })
            .catch(error => {
                console.error('Error fetching time zone data:', error);
                if (type === "initial") {
                    timezone.innerText = "Error fetching time zone data.";
                } else {
                    document.getElementById("timezone-result").innerText = "Error fetching time zone data.";
                }
            });
    }

    function displayNoTimezoneDataError(type) {
        if (type === "initial") {
            timezone.innerText = "No timezone data found for the given coordinates.";
        } else {
            document.getElementById("timezone-result").innerText = "No timezone data found for the given coordinates.";
        }
    }

    submitBtn.addEventListener("click", function() {
        const address = addressInput.value;
        if (address.trim() === "") {
            errorMsg.style.display = "block";
            errorMsg.innerText = "Please enter a valid address.";
        } else {
            errorMsg.style.display = "none";
            const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=bc70ae63ee5f4c75969f7a022e255011`;

            fetch(geocodeUrl)
                .then(response => response.json())
                .then(data => {
                    console.log(data);

                    if (data.features && data.features.length > 0) {
                        const location = data.features[0].geometry.coordinates;
                        const latitude = location[1];
                        const longitude = location[0];

                        document.getElementById("lati-result").innerText = `Lat: ${latitude}`;
                        document.getElementById("longi-result").innerText = `Long: ${longitude}`;

                        fetchTimeZone(latitude, longitude, "result");
                    } else {
                        errorMsg.innerText = "Invalid address, please try again.";
                        errorMsg.style.display = "block";
                    }
                })
                .catch(error => {
                    console.error('Error fetching geocoding data:', error);
                    errorMsg.innerText = "Error fetching geocoding data.";
                    errorMsg.style.display = "block";
                });
        }
    });

    getLocation();
});