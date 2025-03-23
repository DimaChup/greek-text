# scripts/language_patterns/es_patterns.py
PATTERNS = {
    # Spanish verb endings
    'verb_endings': ['ar', 'er', 'ir'],
    
    # Spanish past tense patterns
    'past_patterns': [
        (r'(\w+)aba$', r'\1ar'),   # hablaba (imperfect)
        (r'(\w+)ía$', r'\1ir'),    # comía (imperfect)
        (r'(\w+)í$', r'\1ir'),     # comí (preterite)
        (r'(\w+)é$', r'\1ar')      # hablé (preterite)
    ],
    
    # Spanish imperative patterns
    'imperative_patterns': [
        (r'(\w+)ad(me|te|le|nos|os|les|lo|la|los|las)?$', r'\1ar'),
        (r'(\w+)ed(me|te|le|nos|os|les|lo|la|los|las)?$', r'\1er'),
        (r'(\w+)id(me|te|le|nos|os|les|lo|la|los|las)?$', r'\1ir')
    ],
    
    # Common word mappings for Spanish
    'word_map': {
        'llamadme': 'llamar',
        'repetí': 'repetir',
        'veces': 'vez',
        'esperaba': 'esperar',
        'sentía': 'sentir',
        'otorgaba': 'otorgar',
        'aumentaba': 'aumentar',
        'acercaba': 'acercar'
    },
    
    # Spanish pronouns
    'pronouns': ['me', 'te', 'se', 'nos', 'os', 'les', 'lo', 'la', 'los', 'las']
}