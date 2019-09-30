function allMetrics(compreadyArray, fn, point, metric_name) {

    function covariance(arr1, arr2) {
        let x = vecOperator(arr1, math.mean(arr1), 'subtract', 'value');
        let y = vecOperator(arr2, math.mean(arr2), 'subtract', 'value');
        return math.mean(vecOperator(x, y, 'multiply', 'value'))
    }

    function corr(arr1, arr2) {
        return covariance(arr1, arr2) / (math.std(arr1) * math.std(arr2))
    }

    function xcorr(qsim_new, qobs) {
        let x = qobs;
        let y = qsim_new;
        let n = x.length;
        let i, j = [];
        var mx, my, sx, sy, sxy, denom, r = []
        let maxdelay = 20;
        /* Calculate the mean of the two series x[], y[] */
        mx = 0;
        my = 0;

        for (i = 0; i < n; i++) {
            mx += x[i];
            my += y[i];
        }
        mx /= n;
        my /= n;

        /* Calculate the denominator */
        sx = 0;
        sy = 0;
        for (i = 0; i < n; i++) {
            sx += (x[i] - mx) * (x[i] - mx);
            sy += (y[i] - my) * (y[i] - my);
        }
        denom = math.sqrt(sx * sy);

        /* Calculate the correlation series */
        for (let delay = -maxdelay - 1; delay < maxdelay; delay++) {
            sxy = 0;
            for (i = 0; i < n; i++) {
                j = i + delay;
                if (j < 0 || j >= n) {
                    continue;
                } else {
                    sxy += (x[i] - mx) * (y[j] - my);
                }
            }
            r[delay + maxdelay + 1] = sxy / denom;
        }
        lag = r.indexOf(math.max(r)) - maxdelay + 1
        return [r, lag]
    }

    /**
     * @return {number}
     */
    function NSE(obs, sim) {
        deviationObs = vecOperator(obs, math.mean(obs), 'subtract', 'value');
        deviationSim = vecOperator(sim, math.mean(sim), 'subtract', 'value');
        diff = vecOperator(obs, sim, 'subtract', 'value');
        return 1 - (math.sum(vecOperator(diff, 2, 'power', 'value')) / math.sum(vecOperator(deviationObs, 2, 'power', 'value')))
    }

    function KGE(obs, sim) {
        cc = corr(obs, sim);
        alpha = math.std(sim) / math.std(obs);
        beta = math.sum(sim) / math.sum(obs);
        kge = 1 - math.sqrt((cc - 1) ** 2 + (alpha - 1) ** 2 + (beta - 1) ** 2);
        return kge
    }

    function agreementindex(obs, sim) {
        diff = vecOperator(obs, sim, 'subtract', 'value');
        deviationSim = vecOperator(sim, math.mean(obs), 'subtract', 'value');
        deviationObs = vecOperator(obs, math.mean(obs), 'subtract', 'value');
        devsum = vecOperator(math.abs(deviationSim), math.abs(deviationObs), 'sum', 'value');
        Agreement_index = 1 - (math.sum(vecOperator(diff, 2, 'power', 'value'))) / (math.sum(vecOperator(devsum, 2, 'power', 'value')))
        return Agreement_index
    }


    var subset_year = [];
    fnlist = returnFileList(point['lid'], point['usgs_id'])
    subset_year['Q_obs'] = unpack(compreadyArray[fn], 'obs');
    subset_year['Q_sim'] = unpack(compreadyArray[fn], 'pred');
    subset_year['dt'] = unpack(compreadyArray[fn], 'dt');
    subset_year.forEach(data=>{if (data.length===0){return}});
    let metrics = [];
    if (any(subset_year)) {
        return;
    }

    qref_mean = math.mean(subset_year['Q_obs']);
    qref_std = math.std(subset_year['Q_obs']);
    qsim_mean = math.mean(subset_year['Q_sim']);
    qsim_std = math.std(subset_year['Q_sim']);

    qobs_vol = trapzIntegral(subset_year['Q_obs'], subset_year['dt']);
    qsim_vol = trapzIntegral(subset_year['Q_sim'], subset_year['dt']);
    diff = vecOperator(subset_year['Q_obs'], subset_year['Q_sim'], 'subtract', 'value');
    [, lag] = xcorr(subset_year['Q_sim'], subset_year['Q_obs'])
    peak_qref = math.max(subset_year['Q_obs']);
    idxPeakObs = IsMember([peak_qref], subset_year['Q_obs'])[1][0];
    t_obs_pk = subset_year['dt'][idxPeakObs];
    peak_qsim = math.max(subset_year['Q_sim']);
    idxPeakSim = IsMember([peak_qsim], subset_year['Q_sim'])[1][0];
    t_sim_pk = subset_year['dt'][idxPeakSim];

    metrics['qsim_vol'] = qsim_vol;
    metrics['qobs_vol'] = qobs_vol;
    metrics['ppd'] = (peak_qsim - peak_qref) / peak_qref;
    metrics['timing'] = (moment(t_sim_pk) - moment(t_obs_pk)) / (3600 * 1000);
    metrics['rmse'] = math.sqrt(math.mean(vecOperator(diff, 2, 'power', 'value')));
    metrics['mae'] = math.mean(math.abs(diff));
    metrics['nRMSE'] = metrics['rmse'] / point['Area']; // # Normalized by drainage area in square km
    metrics['nMAE'] = metrics['mae'] / point['Area'];  //# Normalized by drainage area in square km
    metrics['pt_change_vol'] = (qsim_vol - qobs_vol) * 100 / qobs_vol;
    metrics['norm_bias'] = (qsim_mean - qref_mean) / qref_std;
    metrics['peak_qsim'] = peak_qsim;
    metrics['covariance'] = covariance(subset_year['Q_obs'], subset_year['Q_sim']);
    metrics['kge'] = KGE(subset_year['Q_obs'], subset_year['Q_sim']);
    metrics['agreementindex'] = agreementindex(subset_year['Q_obs'], subset_year['Q_sim']);
    metrics['correlationcoefficient'] = corr(subset_year['Q_obs'], subset_year['Q_sim']);
    metrics['rsquared'] = metrics['correlationcoefficient'] ** 2;
    metrics['nashsutcliffe'] = NSE(subset_year['Q_obs'], subset_year['Q_sim']);
    return metrics
}