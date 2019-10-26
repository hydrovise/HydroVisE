


temp.forEach(geom => {
    at_comid = geom.properties.usgs_id;
    ix = markerAttrs.forEach(
        item =>
        item['Year']    == String(systemState.yr) &&
        item['ET']      == systemState.prod &&
        item[comIDName] == at_comid)
        console.log(
            item['Year'],
            item['ET'],
            item[comIDName],
    )

    console.log(at_comid,ix)
})


    ['#fafa6e', '#ff1700']