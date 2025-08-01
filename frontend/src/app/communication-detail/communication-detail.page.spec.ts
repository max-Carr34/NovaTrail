import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationDetailPage } from './communication-detail.page';

describe('CommunicationDetailPage', () => {
  let component: CommunicationDetailPage;
  let fixture: ComponentFixture<CommunicationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
