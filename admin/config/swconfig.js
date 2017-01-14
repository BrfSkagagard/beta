/* global StaticWeb */
(function (sw) {
    sw.config.storage = {
        'type': 'github',
        'repo': 'BrfSkagagard/beta'//,
        //'tokenService': 'https://oauthservice.azurewebsites.net?appName=beta'
    }
    sw.config.permissions = {
        'check': true, /* Only needed if you want different accessability rights. Currently only possible when using github storage */
        'storages': {
            'BrfSkagagard/beta': {
                'type': 'admin',
                'required': ['admin']
            },
            'flowertwig-org/brfskagagard-styrelsen': {
                'type': 'styrelsen',
                'required': ['admin', 'write', 'read']
            },
            'flowertwig-org/brfskagagard-lgh': {
                'type': 'member',
                'required': ['admin', 'write', 'read']
            }
        }
    };
    sw.config.onPage = {
        // Tells StaticWeb show general menu, options and more not present as components on page
        'display': 'onDemand', // 'onDemand', 'always', 'no' 
        'navigation': {
            'display': 'onDemand', // 'onDemand', 'always', 'no'
            'ignorePaths': ['LICENSE', 'admin', 'CNAME', 'resources', 'docs']
        }
    };
})(StaticWeb);
