import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationPanelPage } from './communication-panel.page';

describe('CommunicationPanelPage', () => {
  let component: CommunicationPanelPage;
  let fixture: ComponentFixture<CommunicationPanelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
