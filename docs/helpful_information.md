
[1/28/15, 1:13:19 PM] Priyesh Potdar: curl 'http://54.164.157.178:9090/ag-api/alloffers?pageNumber=1&pageSize=20&ownerId=31445&ownerTypeId=1' -H 'Authorization: adminuser' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,en-GB;q=0.2,zh-TW;q=0.2' -H 'PubToken: adminuser' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36' -H 'Accept: application/json' -H 'Referer: http://localhost:9000/' -H 'resourceId: 24011' -H 'Connection: keep-alive' -H 'resourceType: publisher' --compressed
[1/28/15, 1:15:18 PM] Priyesh Potdar: https://docs.docker.com/installation/mac/

[1/28/15, 1:26:25 PM] Priyesh Potdar: boot2docker init
[1/28/15, 1:31:06 PM] Priyesh Potdar: boot2docker start


[1/29/15, 10:07:39 AM] Priyesh Potdar: boot2docker start
[1/29/15, 10:08:33 AM] Priyesh Potdar: docker login docker.pubmatic.com
[1/29/15, 10:10:28 AM] Priyesh Potdar: cat /etc/sysconfig/docker
[1/29/15, 10:10:35 AM] Priyesh Potdar: cat /etc/default/docker
[1/29/15, 10:13:30 AM] Priyesh Potdar: boot2docker config > ~/.boot2docker/profile
[1/29/15, 10:14:43 AM] Priyesh Potdar: EXTRA_ARGS="--insecure-registry docker.pubmatic.com"
[1/29/15, 10:18:55 AM] Priyesh Potdar: boot2docker ssh
[1/29/15, 10:19:00 AM] Priyesh Potdar: sudo vi /var/lib/boot2docker/profile
[1/29/15, 10:19:19 AM] Priyesh Potdar: DOCKER_OPTS="--insecure-registry docker.pubmatic.com"
[1/29/15, 10:19:35 AM] Priyesh Potdar: boot2docker down

boot2docker up

[1/29/15, 10:19:35 AM] Priyesh Potdar: boot2docker restart
[1/29/15, 10:22:53 AM] Priyesh Potdar: docker pull docker.pubmatic.com/komliadserver-adflex
[1/29/15, 10:36:03 AM] Priyesh Potdar: password10350
[1/29/15, 10:42:49 AM] Priyesh Potdar: AMG-375


```html
  <ng-class="{
    'has-error':   form.$submitted && form.agOfferName.$invalid && form.agOfferName.$dirty,
    'has-success': form.$submitted && form.agOfferName.$valid
  }"
at beginning in link: scope.form.submitted=false;
    . Max length = 256
    . Unique offer name within same publisher
    . Blacklist characters = (?!.*[|!{}\\[\\]^\"~*?:;\\+\\\\]+)
      * Whitelist using negation = ^(?!.*[|!{}\\[\\]^\"~*?:;\\+\\\\]+).*
```

/**
 * william added for id="overlay" switch.
 */
$rootScope.$on("showOverlay", function (event, overlayShow) {
    console.log("trigger showOverlay !!!", overlayShow);
    var ol = document.querySelector("#overlay");
    angular.element(ol).css("display", overlayShow);
    console.log(angular.element(ol), typeof angular.element(ol));
    //return false;
});

/**
 * TODO: william added to set Period column to 'OPEN'.
 * if /alloffers return status field, then remove this.
 */
function addOfferPeriod(responseData) {
    if (/offers/.test($location.path())) {
        return responseData.map(function (obj) {
            if (obj.type === 'AG') {
                obj.period = "OPEN";
            }
            else {
                obj.period = obj.startDate.replace(/[T].*$/, '') + ' - ' + obj.endDate.replace(/[T].*$/, '');
            }
            return obj;
        });
    }
    else {
        return responseData;
    }
}