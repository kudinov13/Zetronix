#!/bin/bash
sqlite3 /var/www/zetronix/data/studio.db "DELETE FROM leads; DELETE FROM sqlite_sequence WHERE name='leads'; SELECT COUNT(*) FROM leads;"
