import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ScraperService {
  constructor(private readonly httpService: HttpService) {}

  async scrapeUrl(url: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService
        .get('http://api.scraperapi.com', {
          params: {
            api_key: process.env.SCRAPERAPI_KEY,
            url,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return data;
  }
}
