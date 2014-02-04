# Chargemaster

The Chargemaster application was created at Castlight Hackday 01 in May 2013.


Wikipedia describes Chargemaster as:

    a comprehensive listing of items billable to a hospital patient or a
    patient's health insurance provider. In practice, it usually contains
    highly inflated prices at several times that of actual costs to the
    hospital.  The chargemaster typically serves as the starting point
    for negotiations with patients and health insurance providers of what
    amount of money will actually be paid to the hospital. It is
    described as "the central mechanism of the revenue cycle" of a
    hospital.

This program displays the Chargemaster price and the Medicaid price for 100 most common procedures at hospitals around the US.  It is based on the data released by HHS in mid-2013.

## License

Copyright (c) 2013-2014 Castlight Health. See the LICENSE file for license rights and
limitations (all rights reserved for now, but soon to be open sourced).

The active elements of this program operate entirely on the browser.  The files can be served from any HTTP or HTTPS server, including a CDN like Amazon's CloudFront.  

You can even serve it directly from the file system, by simply opening the index file, with File -> Open, on your Firefox browser.  This method will not work for Chrome, unfortunately; Chrome's security model does not allow the program to open the necessary local data-files with AJAX.

If you want to run it locally but using a real HTTP server, you can use Python's SimpleHTTPServer, like this:

cd [the directory]
python -m SimpleHTTPServer 3456

And then go to http://localhost:3456/ on your browser.

