import { Component, OnDestroy } from '@angular/core';
import { GenshinWishesService } from '../../api/genshin-wishes/genshin-wishes.service';
import { TopService } from '../../core/top.service';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Lang, LangService } from '../../shared/lang.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnDestroy {
  deleteConfirmation = '';

  lang: Lang | '' = '';
  currentLang: Lang | '' = '';

  wholeClock: boolean | undefined;
  currentWholeClock: boolean | undefined;

  private _destroy = new Subject();

  constructor(
    private _lang: LangService,
    private _gw: GenshinWishesService,
    private _location: Location,
    private _dialog: MatDialog,
    private _auth: AuthService,
    private _translate: TranslateService,
    private _top: TopService,
    private _router: Router
  ) {
    this._top.setTitle('settings.label');

    this._auth.user$.pipe(takeUntil(this._destroy)).subscribe((user) => {
      this.currentLang = this._lang.getCurrentLang();

      this.currentWholeClock = user?.wholeClock;
    });
  }

  updateLang(lang: Lang): void {
    this._gw.updateLang(lang).then(() => {
      if (!lang) {
        return;
      }

      this._auth.setLang(lang);
    });
  }

  updateTimeFormat(wholeClock: boolean): void {
    this._gw.updateTimeFormat(wholeClock).then(() => {
      this._auth.setWholeClock(wholeClock);
      this.wholeClock = wholeClock;
    });
  }

  deleteAccount(): void {
    this._gw
      .deleteAccount()
      .then(() => this._router.navigate(['/logout']))
      .catch(() => {});
  }

  exportWishes(): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'settings.export.confirm.title',
          description: 'settings.export.confirm.description',
          confirm: 'settings.export.action',
          color: 'accent',
        } as ConfirmDialogData,
      })
      .afterClosed()
      .toPromise()
      .then((res) => !!res && window.open('/api/wishes/export'));
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }
}
