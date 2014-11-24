Clump = function(clumpSpace,clumpIndex) {
	var space = clumpSpace;
	this.space = space;
	var currentRoot = NaN;
	var _clumpIndex;

	this.bitset = function(){return space.getbitSetFromIndex(this.clumpIndex)};	
	
	this.transpose = function(offset){ this.clumpIndex = clumpSpace.transpose(this.clumpIndex,offset); return this; }
	this.complement = function(){ this.clumpIndex = clumpSpace.complement(this.clumpIndex); return this;}
	this.invert = function(offset){ this.clumpIndex = clumpSpace.invert(this.clumpIndex,offset); return this;}
	this.togglePitches = function(toggleClumpIndex){ this.clumpIndex = clumpSpace.togglePitches(this.clumpIndex,toggleClumpIndex,this.root); return this;}

	this.plant = function(r) {
		if(typeof r !== 'undefined') {
			currentRoot = r;
		} else {
			currentRoot = this.info.rootPitch;
		}
		return currentRoot;
	}
	
	var getRoot = function() {
		if (currentRoot > -1) {
			return currentRoot;
		} else {
			return this.info.rootPitch;
		}
	}
	
	this.uproot = function(){
		currentRoot = NaN;
	}
	
	this.explore = function(pitchToggleClasses) {
		this.uproot();
		this.plant();
		var rootPitch = this.root;
		var discoveries = {};
		for (var i=0; i<space.octaveSize; i++) {
			var toggleIndex = pitchToggleClasses << i;
			this.togglePitches(toggleIndex);
			discoveries[pitchToggleClasses << (i-rootPitch)] = this.info;
			this.togglePitches(toggleIndex);
		}
		
		return discoveries;
	}
	
	this.metamorph = function(pc) {
		this.uproot(); this.plant();
		var discoveries = {};
		for (var i in pc) {
			this.togglePitches(pc[i]);
			discoveries[pc[i] << this.root] = this.info;
			var transformationCanonicalRoot = this.info.root;
			this.togglePitches(pc[i]);	
		}
		return discoveries;
	}
	
	Object.defineProperties(this, {
		"clumpIndex": {
			"get": function(){return _clumpIndex;},
			"set": 	function(clumpIndex) {
						_clumpIndex = clumpIndex;
						this.info = space.gatherInfo(_clumpIndex);		
					}
				},
		"label": {
			"get": 	function() {
						if (this.info.type = "scale"){
							return this.info.scale;
						} else {
							return this.info.chord;
						}
					}
				},
		"root": {
			"get": getRoot},
		"weight": {
			"get": function(){ return this.info.weight; }
		}
	});
	
	this.clumpIndex = clumpIndex;
}

ClumpSpace = function(){
	var OCTAVE_SIZE = 12;
	var octave = _.range(OCTAVE_SIZE);
	
	Object.defineProperties(this, {
		"octaveSize": { "get": function(){return OCTAVE_SIZE;} }
	});

	
	var currentRoot = NaN;
	function pitchArrayFromIndex(bitset) {
		return _.filter(octave, function(i){
			return (bitset & (1 << i)) > 0;
		})
	};
	
	function pitchArrayToIndex(set) {
		var powersOfTwo = _.map(set, function(i) { return 1 << i; });
		var sum = _.reduce(powersOfTwo, function(sum, i){ return sum + i; }, 0);
		return sum;
	};

	this.getIndexFromPitchArray = pitchArrayFromIndex;

	function bitSetFromIndex(index) {
		return _.map(octave, function(i){
			return (index & (1 << (octave.length - i - 1))) > 0 ? 1 : 0;
		}).join("")
	};
	
	this.getbitSetFromIndex = function(int) {
		return bitSetFromIndex(int);
	}

	function bitSetToIndex(bitset) {
		if (!bitset) {
			return 0;
		}
		var index = 0;
		var size = bitset.length;
		for (i in bitset) {
			if (bitset[i] == "1") {
				index += 1 << (size - i - 1);
			}
		}
		return index;
	};

	function shiftBitSetIndex(bitSetIndex, offset) {
		var upper = bitSetIndex << offset;
		var lower = bitSetIndex >> (OCTAVE_SIZE - offset);
		var mask = (1 << OCTAVE_SIZE) - 1;
		return (upper | lower) & mask;
	}

	function canonicalize(bitSetIndex) {
		return _.min(_.map(octave, function(offset) {
			return shiftBitSetIndex(bitSetIndex, offset);
		}));
	};
	this.cize = canonicalize;

	function getOffsetFromCanonical(bitSetIndex, canonicBitSetIndex) {
		for (var i = 0; i < OCTAVE_SIZE; i++) {
				if (shiftBitSetIndex(canonicBitSetIndex, i) == bitSetIndex) {
					return i;
				}
		}
	};
	
	this.gr = getOffsetFromCanonical;

	this.hammingWeight = function(i) {
		i = i - ((i >> 1) & 0x55555555);
		i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
		return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
	}

	var pitchNames = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
	
	var pcSetNames = {
		"145": {chord: "X△", root: 0},
		"137": {chord: "X-", root: 0},
		"291": {chord: "X△⁷", root: 1},
		"329": {chord: "X⁷", root: 8},
		"73": {chord: "Xm ♭5", root: 0},
		"585": {chord: "X°", root: 0, scale: "X symmetric 4-tone"},
		"273": {chord: "X+", root: 0, scale: "X symmetric 3-tone"},
		"293": {chord: "X-⁷♭5", root: 2},
		"297": {chord: "X-⁷", root: 5},
		"275": {chord: "X△⁷", root: 1},
		"133": {chord: "X2", root: 0},
		"165": {chord: "X2,4", root: 0},
		//"597": {chord: "X9", root: 2},
		"589": {chord: "X7 ♭9", root: 2},
		"613": {chord: "X7 ♯9", root: 2},
		"725": {chord: "X11", root: 2},
		//"1387": {chord: "X13", root: 8, scale: "X diatonic (major)"},
		"1387": {scale: "X △", root: 1},
		"1371": {scale: "X alt", root: 12},
		"859": {scale: "X harmonic minor", root: 1},
		"875": {scale: "X harmonic major", root: 1},
		"871": {scale: "X double harmonic major", root: 1},
		"1365": {scale: "X symmetric hexatonic", root: 0},
		"1755": {scale: "X symmetric octatonic", root: 0},
		"597":  {scale: "pentatonic, complement to X melodic minor", root: 8},
		"661":  {scale: "pentatonic, complement to X diatonic", root: 6},
		"1367": {scale: "X△-loc.", root: 8},
		"981": {scale: "X enigmatic asc.", root: 9},
		"755": {scale: "X minor-enigmatic", root: 6}
	};
	this.setNames = pcSetNames;
		//"1387": {scale: "X diatonic (major)", root: 1},
		//"1371": {scale: "X altered (melodic minor)", root: 8},
		//"859": {scale: "X harmonic minor", root: 1},
		//"875": {scale: "X harmonic major", root: 1},
		//"871": {scale: "X double harmonic major", root: 1},
		//"1365": {scale: "X symmetric hexatonic", root: 0},
		//"1755": {scale: "X symmetric octatonic", root: 0},
		//"597":  {scale: "pentatonic, complement to X melodic minor", root: 8},
		//"661":  {scale: "pentatonic, complement to X diatonic", root: 6},
		//"1367": {scale: "X major locrian", root: 8},
	//};

	this.gatherInfo = function(bitSetIndex) {
		var canonic = canonicalize(bitSetIndex);
		var offset = getOffsetFromCanonical(bitSetIndex, canonic);
		var classification = pcSetNames[canonic];
		var result = {chord:"", scale: "", weight: this.hammingWeight(bitSetIndex), rootPitch:NaN, canonical: canonic};
		result.clumpIndex = bitSetIndex;

		var types = [];
		if (classification) {
			var root = (offset + classification.root + OCTAVE_SIZE) % OCTAVE_SIZE;
			var rootName = pitchNames[root];
			result.rootPitch = root;
			if (classification.chord) {
				types.push("chord");
				result.chord = classification.chord.replace("X", rootName);
			}
			if (classification.scale) {
				types.push("scale");
				result.scale = classification.scale.replace("X", rootName);
			}
		}
		return result;
	};

	var canonicBitSetIndexes = [0,4095,1365,585,1755,273,819,1911,65,195,325,455,
		715,845,975,1495,2015,1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,
		41,43,45,47,49,51,53,55,57,59,61,63,67,69,71,73,75,77,79,81,83,85,87,89,91,
		93,95,97,99,101,103,105,107,109,111,113,115,117,119,121,123,125,127,133,135,
		137,139,141,143,145,147,149,151,153,155,157,159,163,165,167,169,171,173,175,
		177,179,181,183,185,187,189,191,197,199,201,203,205,207,209,211,213,215,217,
		219,221,223,227,229,231,233,235,237,239,241,243,245,247,249,251,253,255,275,
		277,279,281,283,285,287,291,293,295,297,299,301,303,307,309,311,313,315,317,
		319,327,329,331,333,335,339,341,343,345,347,349,351,355,357,359,361,363,365,
		367,371,373,375,377,379,381,383,397,399,403,405,407,409,411,413,415,421,423,
		425,427,429,431,435,437,439,441,443,445,447,457,459,461,463,467,469,471,473,
		475,477,479,485,487,489,491,493,495,499,501,503,505,507,509,511,587,589,591,
		595,597,599,603,605,607,613,615,619,621,623,627,629,631,635,637,639,661,663,
		667,669,671,679,683,685,687,691,693,695,699,701,703,717,719,723,725,727,731,
		733,735,743,747,749,751,755,757,759,763,765,767,821,823,827,829,831,847,853,
		855,859,861,863,871,875,877,879,885,887,891,893,895,925,927,939,941,943,949,
		951,955,957,959,981,983,987,989,991,1003,1005,1007,1013,1015,1019,1021,1023,
		1367,1371,1375,1387,1391,1399,1403,1407,1455,1463,1467,1471,1499,1503,1519,
		1527,1531,1535,1759,1775,1783,1791,1919,1983,2047];

	function parsePitchClasses(str) {
		if (str == "") {
			return [];
		}
		return _.map(str.split(","), function(i){ return parseInt(i);});
	}

	this.transpose = function(clumpIndex, shift) {
		return(shiftBitSetIndex(clumpIndex, shift));
	};

	this.invert = function(clumpIndex, offset) {
		var pitchArray = pitchArrayFromIndex(clumpIndex)
		pitchArray = _.map(pitchArray, function(pc) {
			return (offset - pc + OCTAVE_SIZE) % OCTAVE_SIZE;
		});
		return pitchArrayToIndex(pitchArray);
	};

	this.complement = function(clumpIndex) {
		return (2 << (OCTAVE_SIZE - 1)) - 1 -clumpIndex;
	};
	
	this.togglePitches = function(clumpIndex,toggleIndex,offset){
		var offset = typeof offset !== 'undefined' || offset == NaN? offset : 0;
		return clumpIndex ^ (shiftBitSetIndex(toggleIndex,offset));
	}
};
