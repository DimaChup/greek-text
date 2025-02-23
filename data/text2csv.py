import re
import csv  # This line was missing!

def create_word_list_csv(text, output_filename="word_list.csv"):
    """
    Creates a CSV file containing a list of words from the input text,
    along with their line numbers and word order.

    Args:
        text: The input text (as a single string).
        output_filename: The name of the CSV file to be created.
    """

    lines = text.strip().split('\n')
    word_list = []
    word_order = 1

    with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["Line Number", "Word Order", "Word"])  # Header row

        for line_num, line in enumerate(lines, 1):
            # Remove line numbers like "1. " at the beginning of the line
            line = re.sub(r"^\s*\d+\.\s*", "", line)

            # Tokenize, keeping apostrophes but removing other punctuation
            # This regex handles splitting on spaces and most punctuation, but keeps
            # apostrophes and hyphens within words.
            words = re.findall(r"[\w’'\-]+|[,;]", line)

            for word in words:
                #remove punctuation marks that we dont need seprately
                if word not in [",", "·", "..."]:
                    csv_writer.writerow([line_num, word_order, word])
                    word_order += 1



# Example Usage (with the first 32 lines of Parmenides):
input_text = """
1.  ἵπποι ταὶ με φέρουσιν, ὅσον τ’ ἐπὶ θυμὸς ἱκάνοι,
2.  πέμπον, ἐπεί μ’ ἐς ὁδὸν βῆσαν πολύφημον ἄγουσαι
3.  δαίμονός ἐς φωτῶν· ἐπὶ ταύτῃ γὰρ φέρεται ἄνδρη
4.  σοφίης παντοίης· φέρεν δέ με τ’ ἵπποι ταὶ ταχῖαι
5.  ἅρμα τιταίνουσαι, κόραι δ’ ὁδὸν ἡγεμόνευον.
6.  Ἄξιον ἐς φάος ἦλθον· ἀφ’ Ἡλίου δ’ ἀπέτηκτο
7.  κράντο μέγ’, ἀμφὶ δὲ κόραι ποτὶ κῶας χερσὶν ἔχουσαι
8.  ἕλκον, ἀπὸ κεφαλᾶς δὲ καλύμματα χερσὶν ἔτ’ ἔαχον,
9.  οὕτω νιν πεῖσαν κούραι μαλακοῖς ἐπέεσσι
10. σοὶ φράζειν, ὡς τὰ φαεσφόρα κάλυπτρα διέδηξεν.
11. ἐν δὲ θύραι ἐπέροντο πύλαι τ’ ἐν ἀέθλοισιν ἀχρεῖον
12. ἀμφί περώῳ ἰσχῠρά, τὰς ἐπέμαξαν ἄνωγεν
13. κόραι πυγμαίῃσι, λαβοῖσαι κλώνων παλάμας,
14. κλῆιδ᾽ ἀμοιβόμεναι· ταῖς δ᾽ αὐτομάτως ἀπυρήχθη
15. ἄξων χαλκεότυπος, ὑπὸ δ᾽ οἱ στροφάδες ἑκάστῃ
16. ἑλισσόμεναι ἑκάστῃ ἐπέβριζον ἴαχοις,
17. αἱ δ᾽ εὐθὺς διὰ θυρῶν ἴκοντο πλατεῖς ἐπὶ μαρτύροισιν
18. ἁρμάτων ἐλαύνουσαι· καὶ ἡ θεὸς ἢπτατο κούρῃ·
19. αἵματά μοι, φάτο, κοῦραι, μέλλοντι νεέσθαι
20. αὐτέων ἀνάγκης ὁδὸν ἐς ταύτην περιτελῆ,
21. ἐμβήμεν, διὰ γὰρ πάντ᾽ ἔχρυσεν ἐπὶ πλευρὰ χαλκείας
22. ἐμβολάς, ὁδὸν ὑποφαίνουσα διὰ πάντων ὁδοῖο·
23. μακρὰ δὲ δὴ χρὴ φάος οἴσετε τοῦτο, ἵν᾽ οὐκ ἐπὶ λόγων
24. ἄλλων ὑπ᾽ ἀπάτησθε· ἀπείρητος γὰρ ἐκεῖνος
25. πόντος ἐν ᾧ, πλάνηισιν ἀφάκεα φῦλα βροτεῖα.
26. ἀλλὰ σὺ καὶ γνώσῃ, πολύπειρον δ᾽ ἔμμορε θυμὸν
27. ἀλήθειαν εὐπειθῆ σὺν θυμῷ παστάξῃς·
28. ἀλλ’ ἅμα καὶ δόξας βροτείας ἀπατηλὰς ἀκούσῃς,
29. κόσμον ἐμῶν ἐπέων πυθέμενος, οἵ πώς κεν ἕκαστα
30. φαινόμενα διαπλήσσουσι δοκήσιμον ὄμμα βροτῶν.
31. διδάξω δέ σε καὶ μύθων ἐν πείρασι πάντα,
32. ὡς οὐδὲν χρεών ἐστι τὰ μὴ ἐὸν εἶναι ...
"""

create_word_list_csv(input_text, "data/word_list.csv")
print("CSV file 'parmenides_word_list.csv' created successfully.")