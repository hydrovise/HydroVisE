function IsMember(a, b) {
    // Loop through A using array.some() => value
//     var t0 = performance.now();
    let idxA = [];
    let idxB = [];
    a.forEach(value => {
        // B did not include value
        if (b.includes(value)) {
            // Output
            idxA.push(a.indexOf(value));
        }
    });
    // Loop through B using array.some() => value
    b.forEach(value => {
        // A did not include value
        if (a.includes(value)) {
            // Output
            idxB.push(b.indexOf(value));
        }
    });
    return [idxA, idxB]
}


function remDups(arr, condHeader) {
    return arr.reduce((acc, current) => {
        const x = acc.find(item => item[condHeader] === current[condHeader]);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [])
}