const openpgp = require('openpgp');
const { performance } = require('perf_hooks');
openpgp.config.preferredAEADAlgorithm = openpgp.enums.aead.experimentalGCM
openpgp.config.show_version = false
openpgp.config.show_comment = false
openpgp.config.aeadProtect = true;

(async () => {
    // console.log(cleartextMessage); // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'

})();
