# Dynamic-Crawler-Tool

Dynamic Crawler Tool

Node version: v18.12.1

## Sync data to GCS

```bash
gsutil -m rsync -r /media/saplab/Data_Win/RSI_Do_An/AnhND/Dynamic-Crawler-Tool/output gs://efiss/data/output
```

## Sync data to GCS every 12 hours

```bash
for i in {1..10000}
do
    gsutil -m rsync -r /media/saplab/Data_Win/RSI_Do_An/AnhND/Dynamic-Crawler-Tool/output gs://efiss/data/output
    sleep 43200
done
```
